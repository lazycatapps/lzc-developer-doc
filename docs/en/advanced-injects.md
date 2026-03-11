Script Injection (injects)
=========================

Overview
========

`injects` lets you adapt application behavior without changing OCI images or upstream source code, by injecting scripts into browser, request, or response phases.
For field definitions, see [manifest.md#injects](./spec/manifest.md#injects). This page focuses on runtime behavior and practical usage.
If you want ready-to-use request inject patterns for development, continue with [Request Inject Dev Cookbook](./advanced-inject-request-dev-cookbook.md).

Use Cases
=========

- Password autofill and auto-login: see [Passwordless Login](./advanced-inject-passwordless-login.md).
- CORS/CSP fine tuning: add/remove response headers on specific routes.
- Replace browser file dialog with Lazycat storage flow.
- Hide or modify specific page elements without upstream source changes.
- Advanced routing: dynamic reverse proxy control via `ctx.proxy`.
- Request/response compatibility fixes (headers, WebSocket details, etc.).
- User-scoped persistence with `ctx.persist`.
- Request-level troubleshooting with `ctx.dump`.

Phase And Runtime
=================

Each inject belongs to exactly one phase:

- `on=browser`: runs in real browser runtime.
- `on=request`: runs in lzcinit sandbox before upstream forwarding.
- `on=response`: runs in lzcinit sandbox after upstream response.

Execution order:

- First by `application.injects` declaration order.
- Then by `do[]` order inside each inject.
- Match strategy is `all-match-run` within the same phase.

Short-circuit behavior:

- In `request/response`, once `ctx.response.send(...)` or `ctx.proxy.to(...)` takes effect, remaining scripts in that phase stop.
- Any script error stops current phase immediately.

Matching Rules
==============

Matching fields:

- `when`: OR match rules; any matched rule enters candidate set.
- `unless`: OR exclude rules; any matched rule rejects candidate.
- `prefix_domain`: host prefix filter (`<prefix>-...`).
- `auth_required`: default `true`; skip inject when no valid `SAFE_UID`.

Single-rule format:

`<path-pattern>[?<query>][#<hash-pattern>]`

Rule semantics:

- Only suffix `*` is supported (prefix matching); without `*`, match is exact.
- Query token supports `key` and `key=value`.
- Query tokens in one rule are AND.
- `#hash` is supported only in `browser`; not supported in `request/response`.

Examples:

- `"/"`: root only.
- `"/*"`: any path.
- `"/api/*?v=2"`: `/api/` prefix + query contains `v=2`.
- `"/#login"`: hash equals `login` (browser only).

Manifest Example
================

```yml
application:
  injects:
    - id: login-autofill
      when:
        - /#login
        - /#signin
      do:
        - src: builtin://hello
          params:
            message: "hello world"

    - id: inject-basic-auth-header
      auth_required: false
      on: request
      when:
        - /api/*
      do: |
        ctx.headers.set("Authorization", "Basic " + ctx.base64.encode("admin:admin123"));

    - id: remove-cors
      on: response
      when:
        - /api/*
      unless:
        - /api/admin/*
      do: |
        ctx.headers.del("Access-Control-Allow-Origin");
        ctx.headers.del("Access-Control-Allow-Credentials");
```

`do` Syntax
===========

`do` supports two forms:

- short syntax: `do` is a script string (single script entry).
- long syntax: `do` is `[]InjectScriptConfig` (multiple entries with per-script params).

Dynamic Params `$persist`
=========================

`params` supports `$persist` markers, resolved by current request `SAFE_UID`:

- `{ $persist: "key" }`
- `{ $persist: "key", default: <any> }`

Behavior:

- Use persisted value when key exists.
- Use `default` when key missing and default is provided.
- Return `null` when key missing and default is not provided.

`ctx` Overview
==============

Common fields for all phases:

- `ctx.id` / `ctx.src` / `ctx.phase` / `ctx.params` / `ctx.safe_uid`
- `ctx.request.host` / `ctx.request.path` / `ctx.request.raw_query`

Common browser fields:

- `ctx.request.hash`
- `ctx.runtime.executedBefore`
- `ctx.runtime.executionCount`
- `ctx.runtime.trigger`
- `ctx.persist` (Promise API)

Common request/response helpers:

- `ctx.headers`
- `ctx.body`
- `ctx.flow`
- `ctx.persist`
- `ctx.response`
- `ctx.proxy`
- `ctx.base64` / `ctx.fs` / `ctx.dump`

Full ctx specification:

- [inject.ctx](./spec/inject-ctx.md)

Built-in Scripts
================

Most commonly used built-in script:

- `builtin://simple-inject-password`

For a complete walkthrough:

- [Passwordless Login](./advanced-inject-passwordless-login.md)

Validation And Troubleshooting
==============================

Recommended workflow:

1. Start with a minimal short-syntax script (for example `console.log`) to verify matching.
2. Add one behavior helper (`ctx.headers` or `ctx.body`) for single-point verification.
3. Then introduce `ctx.flow` + `ctx.persist` for cross-phase coordination.

Common mistakes:

- Using `#hash` rule in `on=request/response`.
- Expecting inject to run without `SAFE_UID` while `auth_required=true`.
- Calling `ctx.body.getJSON()` on non-JSON payload without error handling.
