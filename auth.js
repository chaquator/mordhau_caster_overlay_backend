export function verifyAuthGeneric(req, authSessionFunc, authKeyFunc) {
    if (authSessionFunc(req)) {
        return true;
    } else {
        const authKey = req.body.authKey;
        if (authKey && authKeyFunc(authKey)) {
            return true;
        }
    }
    return false;
}
