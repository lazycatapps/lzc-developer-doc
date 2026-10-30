# http headers

All https/http traffic initiated from the client will first enter the `lzc-ingress` component for traffic distribution.

lzc-ingress mainly handles the following tasks:

- Authenticate http requests, redirect to login page if not logged in
- Distribute traffic to different lzcapp backends based on the requested domain

Before forwarding to the specific lzcapp after successful authentication, `lzc-ingress` will set the following additional http headers:

- `X-HC-User-ID`        Logged in UID (username)
- `X-HC-User-Groups`    A JSON array of the current user's groups, containing group UUIDs and Base64-encoded names; omitted when the user has no groups. See [User groups](#user-groups) (`lzcos v1.6.3+`).
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

## `X-HC-User-Groups` {#user-groups}

A user group is a collection of users. Applications can use group membership to implement their own permission checks. This capability requires `lzcos v1.6.3` or later.

When a real client accesses an lzcapp through the normal `lzc-ingress` entry point and authentication succeeds, the application receives the current user's group information in `X-HC-User-Groups`:

- The system sends a single header whose value is directly a JSON array. Each element contains only two string fields: `id` is the group's stable UUID in plain text; `name` is the standard Base64 encoding of the current group name's UTF-8 bytes, retaining any required `=` padding.
- Applications first parse the header value as JSON, then Base64-decode each `name` and read the result as UTF-8 to obtain the display name. Applications can bind permission rules to `id`; renaming a group does not change its `id`.
- The header is omitted when the user has no groups. Unauthenticated requests do not include it either.
- `lzc-ingress` removes any caller-supplied header of the same name and sets the value from the authenticated user's actual memberships.
- After an administrator saves membership or group name changes, each new request reflects the latest memberships and names without requiring the user to log in again.

### Format and decoding example

For example, if the user belongs to “研发组 A”, the header value is:

```json
[{"id":"550e8400-e29b-41d4-a716-446655440000","name":"56CU5Y+R57uEIEE="}]
```

The following command requires Python 3 and demonstrates the order of parsing the header and decoding group names:

```bash
python3 - <<'PY'
import base64
import json

header = '[{"id":"550e8400-e29b-41d4-a716-446655440000","name":"56CU5Y+R57uEIEE="}]'
groups = json.loads(header)
for group in groups:
    name = base64.b64decode(group["name"], validate=True).decode("utf-8")
    print(group["id"], name)
PY
```

The output is `550e8400-e29b-41d4-a716-446655440000 研发组 A`.
