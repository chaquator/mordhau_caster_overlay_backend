import express from 'express'
import statusManager from '../statusManager.js';
import keyManager from '../keyManager.js';
import { verifyAuthGeneric } from '../auth.js'

const verifyAuthStatus = req => verifyAuthGeneric(
    req,
    req => req.session.authenticated,
    key => keyManager.validKey(key)
);
const statusRouter = express.Router();

statusRouter.get('/auth', (req, res) => {
    res.sendStatus(verifyAuthStatus(req) ? 200 : 401);
});

statusRouter.post('/login', (req, res) => {
    if (verifyAuthStatus(req)) {
        req.session.authenticated = true;
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

statusRouter.post('/logout', (req, res) => {
    if (verifyAuthStatus(req)) {
        req.session.authenticated = false;
        res.sendStatus(200);
    } else {
        res.status(401).send('Not logged in');
    }
});

// change status
statusRouter.post('/set_status', (req, res) => {
    if (!verifyAuthStatus(req)) {
        res.sendStatus(401);
        return;
    }

    const new_status = statusManager.setStatus(req.body.status);

    res.json(new_status);
});

export default statusRouter;
