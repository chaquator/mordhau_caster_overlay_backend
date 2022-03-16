import log from './log.js'

export function verifyAuthGeneric(req, authSessionFunc, authKeyFunc) {
    if (authSessionFunc(req)) {
        log.debug({ ip: req.ip }, "Authorized by session.");
        return true;
    } else {
        const authKey = req.body.authKey;

        if (authKey && authKeyFunc(authKey)) {
            log.debug({ ip: req.ip, key: authKey }, "Authorized by key");
            return true;
        }
    }

    log.info({ ip: req.ip, key: req.body.authKey }, "Failed to authorize");
    return false;
}
