# Mordhau Caster Overlay Backend
Backend for the Mordhau caster overlay.

# Environment variables
 * `EXPRESS_PORT` - Port for express backend
 * `WS_PORT` - Port for WebSocket server

# API Routes
 * `/api/data` - Current HUD overlay status as a JSON response using the following schema:
```javascript
{
    show_hud: boolean,
    hud: {
        red_team: string,
        red_score: number,
        blue_team: string,
        blue_score: number
    }
}
```

## Status API routes
Status routes manage the current status display of the overlay.
 * `/api/status/auth` - Test authentication for status manager. Either supply authorization key or have an authenticated cookie session.
 * `/api/status/login` (POST) - Log in as a status manager. Supply an authentication key with the following JSON schema:
```javascript
{
    authKey: string
}
```
 * `/api/status/logout` (POST) - Log out as a status manager.
 * `/api/status/set_status` (POST) - Set status. Supply the new overlay status value as an object in the following JSON schema:
```javascript
{
   authKey?: string, // Use if you are not authenticated with cookies
   status: {
       // See overlay status schema
   }
}
```

## Key manager API routes
Key manager creates and deletes keys used for the status manaer.
 * `/api/keys/auth` - Test authentication for the key manager. Either supply an authorization key or have an authenticated cookie session.
 * `/api/keys/keys` - Retrieve a list of all current keys. Requires authenticaiton.
 * `/api/keys/login` (POST) - Log in as a key manager. Supply an authentication key using the following JSON schema:
```javascript
{
    authKey: string
}
```
 * `/api/keys/logout` (POST) - Log out as a key manager.
 * `/api/keys/create_key` (POST) - Create a new key. Requires authentication. Returns a key using the following JSON schema:
```javascript
{
    key: string
}
```
 * `/api/keys/delete_key` (POST) - Delete a key. Requires authentication. Supply a key to delete using the following JSON schema:
 ```javascript
{
    key: string
}
```
 * `/api/keys/clear_keys` (POST) - Clear all keys. Requires authentication.

# WebSocket
Connect to the base route `/`. Upon connecting, and any time the status changes, clients will receive a broadcast with
a new status object using the same JSON schema as seen in the express backend route `/api/data`.
