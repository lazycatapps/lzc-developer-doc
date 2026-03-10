# Passwordless Login

Goal
====

After this page, you can implement:

1. Simple flow: `builtin://simple-inject-password` + deploy params for semi-fixed credentials.
2. Advanced flow: request/response/browser coordination to persist updated password and auto-fill both login page and password-change page.

Common Approaches
=================

In LCMD apps, common “passwordless / low-friction login” approaches are:

1. Build user identity management directly on ingress-injected headers (see [HTTP Headers](./http-request-headers.md)).
2. Integrate standard OIDC login flow (see [OIDC Integration](./advanced-oidc.md)).
3. Inject fixed credentials via deploy params or deploy-time envs (see [manifest.yml Rendering](./advanced-manifest-render.md) and [Environment Variables](./advanced-envs.md)).
4. Inject Basic Auth headers automatically (see [Example 1: Inject Basic Auth Header](#example-1-inject-basic-auth-header)).
5. Rewrite behavior via inject without changing upstream source code (focus of this page).

Prerequisites
=============

1. Your lzcos version supports inject.
2. You have read [Script Injection (injects)](./advanced-injects.md) and [manifest inject spec](./spec/manifest.md#injects).
3. You understand deploy-param rendering (see [manifest.yml Rendering](./advanced-manifest-render.md)).

Example 1: Inject Basic Auth Header
===================================

Use when:

- Upstream service uses Basic Auth.
- You want to inject auth header at gateway level without changing upstream service config.

```yml
application:
  injects:
    - id: inject-basic-auth-header
      on: request
      auth_required: false
      when:
        - /api/*
      do: |
        ctx.headers.set("Authorization", "Basic " + ctx.base64.encode("admin:admin123"));
```

Example 2: Deploy Params + simple-inject-password
==================================================

Use when:

- Login username is mostly fixed, or provided by deploy params.
- You only need autofill and do not need to learn updated passwords from app-side changes.

Steps
-----

1. Define deploy params (`lzc-deploy-params.yml`):

```yml
params:
  # Fixed default username for predictable first login
  - id: login_user
    type: string
    name: "Login User"
    description: "Default login username"
    default_value: "admin"

  # Random default password to avoid weak credentials
  - id: login_password
    type: secret
    name: "Login Password"
    description: "Default login password"
    default_value: "$random(len=20)"
```

2. Add browser inject in `lzc-manifest.yml`:

```yml
application:
  injects:
    # browser phase: run only on login-related hash routes
    - id: login-autofill
      when:
        - /#login
        - /#signin
      do:
        - src: builtin://simple-inject-password
          params:
            # Fixed username from deploy params
            user: "{{ index .U \"login_user\" }}"
            # Initial random password from deploy params
            password: "{{ index .U \"login_password\" }}"
```

Verification
------------

1. Fill deploy params on install (if skipped, username is `admin` and password uses random default).
2. Open login page that matches `when`.
3. Verify username/password are auto-filled.

Example 3: Three-Phase Coordination (Jellyfin)
===============================================

Use when:

- Admin account/password are created by user on first startup.
- User may later change password, and autofill should follow the latest value.

Core idea
---------

1. In request phase, observe setup/login/password-update requests and write candidate values into `ctx.flow`.
2. In response phase, only persist values when response is successful.
3. In browser phase, read from `ctx.persist` to autofill login page and current-password input in profile page.

Complete `lzc-manifest.yml` example
-----------------------------------

```yml
application:
  subdomain: jellyfininject
  public_path:
    - /
  routes:
    - /=http://jellyfin.org.snyh.debug.jellyfininject.lzcapp:8096
  gpu_accel: true
  injects:
    # request phase: capture candidate username/password from setup/login/password-update requests
    - id: jellyfin-capture-password
      auth_required: false
      on: request
      when:
        - /Startup/User
        - /Users/*
      do: |
        const path = String(ctx.request.path || "");
        const method = String(ctx.request.method || "").toUpperCase();

        const isSetup = path === "/Startup/User" && method === "POST";
        const isUserAuth = /^\/Users\/AuthenticateByName$/i.test(path) && method === "POST";
        const isPasswordUpdate = /^\/Users\/[^/]+\/(Password|EasyPassword)$/i.test(path) && (method === "POST" || method === "PUT");
        if (!isSetup && !isUserAuth && !isPasswordUpdate) return;

        let payload = null;
        try {
          payload = ctx.body.getJSON();
        } catch {
          payload = null;
        }
        if (!payload || typeof payload !== "object") return;

        const pickString = (...values) => values.find((v) => typeof v === "string" && v.length > 0) ?? "";
        const username = pickString(payload.Name, payload.Username, payload.UserName, payload.userName);
        const password = pickString(
          payload.NewPw,
          payload.NewPassword,
          payload.newPw,
          payload.newPassword,
          payload.Password,
          payload.password,
          payload.Pw,
          payload.pw,
        );

        if (username) ctx.flow.set("jf_pending_username", username);
        if (password) ctx.flow.set("jf_pending_password", password);

    # response phase: commit into persist only when response is successful
    - id: jellyfin-commit-password
      auth_required: false
      on: response
      when:
        - /Startup/User
        - /Users/*
      do: |
        if (ctx.status < 200 || ctx.status >= 300) return;

        const username = ctx.flow.get("jf_pending_username");
        const password = ctx.flow.get("jf_pending_password");
        if (typeof username === "string" && username.length > 0) {
          ctx.persist.set("jellyfin.username", username);
        }
        if (typeof password === "string" && password.length > 0) {
          ctx.persist.set("jellyfin.password", password);
        }

    # browser phase: autofill login page username/password
    - id: jellyfin-login-autofill
      when:
        - /web/*#/login.html*
        - /web/*#/startup/login*
      do:
        - src: builtin://simple-inject-password
          params:
            user:
              $persist: jellyfin.username
            password:
              $persist: jellyfin.password
            userSelector: "#txtManualName"
            passwordSelector: "#txtManualPassword"

    # browser phase: autofill current password on profile page (no auto-submit)
    - id: jellyfin-userprofile-current-password
      when:
        - /web/*#/userprofile.html*
      do:
        - src: builtin://simple-inject-password
          params:
            password:
              $persist: jellyfin.password
            passwordSelector: "#txtCurrentPassword"
            autoSubmit: false

services:
  jellyfin:
    image: registry.lazycat.cloud/nyanmisaka/jellyfin:250503-amd64
    binds:
      - /lzcapp/var/config:/config
      - /lzcapp/var/cache:/cache
      - /lzcapp/run/mnt/media:/media/
```

Verification
------------

1. Initialize admin account, then log out and return to login page. Verify autofill is active.
2. Change password on profile page. Verify current-password field is auto-filled with old password.
3. Log out after successful password change. Verify next login page autofills the new password.

Common Mistakes
===============

1. Using hash rules (`#...`) in `on=request/response` injects.
2. Writing directly to `persist` in request phase, without response success gating.
3. Not setting selectors for non-standard pages, causing partial autofill.

Appendix: `builtin://simple-inject-password` Parameters
========================================================

| Name | Type | Description |
| ---- | ---- | ---- |
| `user` | `string` | Username value, default empty |
| `password` | `string` | Password value, default empty |
| `requireUser` | `bool` | Require username input; default logic: `false` when `allowPasswordOnly=true`, else `true` when `user` is non-empty |
| `allowPasswordOnly` | `bool` | Allow password-only autofill, default `false` |
| `autoSubmit` | `bool` | Auto submit, default `true` |
| `submitMode` | `string` | `auto`/`requestSubmit`/`click`/`enter`, default `auto` |
| `submitDelayMs` | `int` | Delay before auto submit (ms), default `50`, min `0` |
| `retryCount` | `int` | Auto-submit retry count, default `10` |
| `retryIntervalMs` | `int` | Retry interval (ms), default `300` |
| `observerTimeoutMs` | `int` | DOM/state observation timeout (ms), default `8000` |
| `debug` | `bool` | Enable debug logs, default `false` |
| `userSelector` | `string` | Explicit selector for username input |
| `passwordSelector` | `string` | Explicit selector for password input |
| `formSelector` | `string` | Limit search scope to container |
| `submitSelector` | `string` | Explicit selector for submit button |
| `allowHidden` | `bool` | Allow hidden inputs, default `false` |
| `allowReadOnly` | `bool` | Allow read-only inputs, default `false` |
| `onlyFillEmpty` | `bool` | Fill only empty fields, default `false` |
| `allowNewPassword` | `bool` | Allow `autocomplete=new-password`, default `false` |
| `includeShadowDom` | `bool` | Search open Shadow DOM, default `false` |
| `shadowDomMaxDepth` | `int` | Shadow DOM recursion depth limit, default `2` |
| `preferSameForm` | `bool` | Prefer username in same form as password, default `true` |
| `eventSequence` | `string` or `[]string` | Triggered events, default `input,change,keydown,keyup,blur` |
| `keyValue` | `string` | Key value for keyboard events, default `a` |
| `userKeywords` | `string` or `[]string` | Extra username keywords |
| `userExcludeKeywords` | `string` or `[]string` | Extra username exclude keywords |
| `passwordKeywords` | `string` or `[]string` | Extra password keywords |
| `passwordExcludeKeywords` | `string` or `[]string` | Extra password exclude keywords |
| `submitKeywords` | `string` or `[]string` | Extra submit-button keywords |
