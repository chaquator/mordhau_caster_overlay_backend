import process from 'process';
import crypto from 'crypto';
import express from 'express';
import session from 'express-session';
import httpProxy from 'http-proxy';
import { WebSocketServer } from 'ws';
import log from './log.js';
import statusManager from './statusManager.js';
import keyManager from './keyManager.js';
import statusRouter from './api/status.js';
import keyManagerRouter from './api/keys.js';

function generateSessionSecret() {
    return crypto.randomBytes(192).toString('base64');
}

const session_secret = process.env.SESSION_SECRET || generateSessionSecret();
const port = process.env.EXPRESS_PORT || 8080;
const ws_port = process.env.WS_PORT || 8081;
const standalone = process.env.STANDALONE === 'true';
let ws_proxy;

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

const wss = new WebSocketServer({ port: ws_port },
    () => {
        log.info(`WebSocket server listening at port ${ws_port}`);
    });

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

if (standalone) {
    log.debug('Running in standalone mode');

    // Use express to serve static files if standalone
    app.use(express.static('public'));
    app.get('*', (_, res) => {
        res.sendFile('public/index.html', {
            root: '.'
        });
    });

    // Create WebSocekt proxy and listen for /wsapp route
    ws_proxy = httpProxy.createProxyServer({
        ws: true
    });
    app.get('/wsapp', (req, res) => {
        proxy.ws(req, res, { target: `http://localhost:${ws_port}/` });
    });
}

const server = app.listen(port, () => log.info(`express server listening at port ${port}`));
if (standalone && ws_proxy) {
    // Handle upgrades with proxy on standalone
    server.on('upgrade', (req, socket, head) => {
        ws_proxy.ws(req, socket, head, { target: `http://localhost:${ws_port}/` });
    });
}

if (process.env.MANAGER_KEY) {
    keyManager.setManagerKey(process.env.MANAGER_KEY);
    log.info('Using manager key from environment variable');
} else {
    const key = keyManager.generateManagerKey();
    log.info(`Manager key: ${key}`);
}
