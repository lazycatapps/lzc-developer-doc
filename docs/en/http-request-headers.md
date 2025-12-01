http headers
==============

All https/http traffic initiated from the client will first enter the `lzc-ingress` component for traffic distribution.

lzc-ingress mainly handles the following tasks:

- Authenticate http requests, redirect to login page if not logged in
- Distribute traffic to different lzcapp backends based on the requested domain

Before forwarding to the specific lzcapp after successful authentication, `lzc-ingress` will set the following additional http headers:

- `X-HC-User-ID`        Logged in UID (username)
- `X-HC-Device-ID`      Unique ID of the client within this LCMD, applications can use this as a device identifier
- `X-HC-Device-PeerID`  Client's peerid, for internal use only.
- `X-HC-Device-Version` Client's kernel version number
- `X-HC-Login-Time`     Last login time of the LCMD client, formatted as unix timestamp (an int32 integer)
- `X-HC-User-Role`      Normal users: "NORMAL", administrator users: "ADMIN"
- `X-Forwarded-Proto`   Fixed as "https" so that a small number of applications that force https can work normally
- `X-Forwarded-By`      Fixed as "lzc-ingress"

`lzc-ingress` authenticates through the `HC-Auth-Token` cookie (authentication is completed through other internal methods within the client).

When `lzc-ingress` encounters an invalid or empty cookie value, and the target address is not `public_path`, it will redirect to the login page.

When the target address is `public_path`, `lzc-ingress` will still perform authentication once, but will not redirect to the login page.
- If authentication fails, it will clear the above `X-HC-XX` headers to avoid some security risks
- If authentication succeeds, it will include the above `X-HC-XX` headers.

That is, when lzcapp developers write backend code, they don't need to consider whether it's `public_path`, they can directly trust `X-HC-User-ID`.
