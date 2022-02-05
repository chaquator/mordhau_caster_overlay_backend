import process from 'process';
import express from 'express';
import session from 'express-session';
import { WebSocketServer } from 'ws';
import statusManager from './statusManager.js';
import keyManager from './keyManager.js';
import statusRouter from './api/status.js';
import keyManagerRouter from './api/keys.js';

const session_secret = process.env.SESSION_SECRET;
if (!session_secret) {
    throw 'SESSION_SECRET environment variable is required.\nRecommend: dd if=/dev/urandom bs=192 count=1 status=none | base64 -w0';
}
const port = process.env.PORT || 80;

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
const wss = new WebSocketServer({ noServer: true });

// app.get('/', (_, res) => {
//     res.sendFile('public/hud.html', { root: '.' });
// });

app.get('/data', (_, res) => {
    res.send(JSON.stringify(statusManager.getStatus()));
});

app.get('/icon_map', (_, res) => {
    res.sendFile('public/icon_map.json', { root: '.' });
});

// app.get("*", (_, res) => {
//     const react_flle_path = path.resolve(process.cwd(), react_build_path, "index.html");
//     console.log(react_flle_path);
//     res.sendFile(react_flle_path);
// });

const apiRouter = express.Router();
app.use('/api', apiRouter);
apiRouter.use('/status', statusRouter);
apiRouter.use('/keys', keyManagerRouter);

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

const server = app.listen(port, () => console.log(`Server running on port ${port}`));
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});

if (process.env.MANAGER_KEY) {
    keyManager.setManagerKey(process.env.MANAGER_KEY);
    console.log('Using manager key from environment variable');
} else {
    const key = keyManager.generateManagerKey();
    console.log(`Manager key: ${key}`);
}