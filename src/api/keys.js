import express from 'express'
import log from '../log.js'
import keyManager from '../keyManager.js';
import { verifyAuthGeneric } from '../auth.js'

const verifyAuthKeyManager = req => {
    log.debug({ ip: req.ip }, 'Key manager auth check');
    return verifyAuthGeneric(
        req,
        req => req.session.keyManager,
        key => keyManager.isManagerKey(key)
    )
};
const keyManagerRouter = express.Router();

keyManagerRouter.get('/auth', (req, res) => {
    res.sendStatus(verifyAuthKeyManager(req) ? 200 : 401);
});

keyManagerRouter.get('/keys', (req, res) => {
    if (!verifyAuthKeyManager(req)) {
        res.sendStatus(401);
        return;
    }

    res.json({ keys: keyManager.getKeys() });
});

keyManagerRouter.post('/login', (req, res) => {
    if (verifyAuthKeyManager(req)) {
        log.info({ iq: req.ip, key: req.body.authKey }, 'Key manager login');
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
    log.info({ ip: req.ip, keyCreate: key }, 'Creating new key');
    res.json({ key: key });
});

keyManagerRouter.post('/delete_key', (req, res) => {
    if (!verifyAuthKeyManager(req)) {
        res.sendStatus(401);
        return;
    }

    const key = req.body.key;

    log.info({ ip: req.ip, keyDelete: key }, 'Deleting key');

    if (keyManager.deleteKey(key)) {
        res.sendStatus(200);
    } else {
        log.warn({ ip: req.ip, keyDelete: key }, 'Delete key failed.');
        res.sendStatus(400);
    }
});

keyManagerRouter.post('/clear_keys', (req, res) => {
    if (!verifyAuthKeyManager(req)) {
        res.sendStatus(401);
        return;
    }

    keyManager.clearKeys();

    log.info({ ip: req.ip }, 'Clearing keys');

    res.sendStatus(200);
});

export default keyManagerRouter;
