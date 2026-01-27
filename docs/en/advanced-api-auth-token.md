# API Auth Token

API Auth Token is used to authenticate system API calls from scripts or the command line without relying on a browser login session. It is suitable for automation, ops scripts, CI, and similar scenarios.

Requires lzcos v1.4.3+.

## Generate and manage

```bash
hc api_auth_token gen
hc api_auth_token gen --uid admin
hc api_auth_token list
hc api_auth_token show <token>
hc api_auth_token rm <token>
```

- `gen` creates a UUID-form token
- `--uid` binds the token to a user; if not specified, the admin user is used by default

## Example

```bash
curl -k -H "Lzc-Api-Auth-Token: <token>" "https://<box-domain>/sys/whoami"
```

## Behavior notes

- The header name is fixed as `Lzc-Api-Auth-Token`
- This header is only for system authentication and will be removed when forwarding to applications
- Token permissions are equivalent to the bound user; keep it safe and avoid leakage
- Some lpk apps use client info from authentication for reverse access, which is not supported with API tokens
- In this mode the system will not inject `X-HC-Device-PeerID` and `X-HC-Device-ID`
- In this mode `X-HC-Login-Time` is the token creation time
