import express from 'express'
import keyManager from '../keyManager.js';
import { verifyAuthGeneric } from '../auth.js'

const verifyAuthKeyManager = req => verifyAuthGeneric(
    req,
    req => req.session.keyManager,
    key => keyManager.isManagerKey(key)
);
const keyManagerRouter = express.Router();

keyManagerRouter.get('/auth', (req, res) => {
    res.sendStatus(verifyAuthKeyManager(req) ? 200 : 401);
});

keyManagerRouter.get('/keys', (req, res) => {
    if (!verifyAuthKeyManager(req)) {
        res.sendStatus(401);
        return;
    }

    res.send(JSON.stringify({ keys: keyManager.getKeys() }));
});

keyManagerRouter.post('/login', (req, res) => {
    if (verifyAuthKeyManager(req)) {
        req.session.keyManager = true;
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

keyManagerRouter.post('/logout', (req, res) => {
    if (verifyAuthKeyManager(req)) {
        req.session.keyManager = false;
        res.sendStatus(200);
    } else {
        res.status(401).send('Not logged in');
    }
});

keyManagerRouter.post('/create_key', (req, res) => {
    if (!verifyAuthKeyManager(req)) {
        res.sendStatus(401);
        return;
    }

    const key = keyManager.createAndAddKey();
    res.send(JSON.stringify({ key: key }));
});

keyManagerRouter.post('/delete_key', (req, res) => {
    if (!verifyAuthKeyManager(req)) {
        res.sendStatus(401);
        return;
    }

    const key = req.body.key;
    if (keyManager.deleteKey(key)) {
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

keyManagerRouter.post("/clear_keys", (req, res) => {
    if (!verifyAuthKeyManager(req)) {
        res.sendStatus(401);
        return;
    }

    keyManager.clearKeys();
    res.sendStatus(200);
});

export default keyManagerRouter;
