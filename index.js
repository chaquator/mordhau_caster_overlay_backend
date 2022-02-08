import process from 'process';
import express from 'express';
import session from 'express-session';
import { WebSocketServer } from 'ws';
import log from './log.js';
import statusManager from './statusManager.js';
import keyManager from './keyManager.js';
import statusRouter from './api/status.js';
import keyManagerRouter from './api/keys.js';

const session_secret = process.env.SESSION_SECRET;
if (!session_secret) {
    throw 'SESSION_SECRET environment variable is required.\nRecommend: dd if=/dev/urandom bs=192 count=1 status=none | base64 -w256';
}
const port = process.env.PORT || 8080;
const ws_port = process.env.WS_PORT || 8081;

const twelve_hrs = 1000 * 60 * 60 * 12;
const app = express()
    .use(express.json())
    .use(session({
        cookie: {
            expires: twelve_hrs
        },
        resave: false,
        saveUninitialized: false,
        secret: session_secret,
    }));

if (process.env.NODE_ENV != "production") {
    app.use('/public', express.static('../public'));
}

const wss = new WebSocketServer({ noServer: false, port: ws_port });

const apiRouter = express.Router();
app.use('/api', apiRouter);

apiRouter.use('/status', statusRouter);
apiRouter.use('/keys', keyManagerRouter);

apiRouter.get('/data', (_, res) => {
    res.json(statusManager.getStatus());
});

// Send current score to newly connecting clients
wss.on('connection', socket => {
    socket.send(JSON.stringify(statusManager.getStatus()));
});

// Broadcast status to clients when status changes
statusManager.statusEmitter.on('status', status => {
    const status_str = JSON.stringify(status);
    wss.clients.forEach(socket => {
        socket.send(status_str);
    });
});

const server = app.listen(port, () => log.info(`Server running on port ${port}`));
// server.on('upgrade', (request, socket, head) => {
//     log.info({ip: socket.remoteAddress}, "Upgrade");
//     wss.handleUpgrade(request, socket, head, socket => {
//         wss.emit('connection', socket, request);
//     });
// });

if (process.env.MANAGER_KEY) {
    keyManager.setManagerKey(process.env.MANAGER_KEY);
    log.info('Using manager key from environment variable');
} else {
    const key = keyManager.generateManagerKey();
    log.info(`Manager key: ${key}`);
}
