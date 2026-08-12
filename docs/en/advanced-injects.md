# Script Injection (injects)

## Overview

`injects` lets you adapt application behavior without changing OCI images or upstream source code, by injecting scripts into browser, request, or response phases.
For field definitions, see [manifest.md#injects](./spec/manifest.md#injects). This page brings matching and execution behavior, the `ctx` API, troubleshooting, and practical guidance together in one place.
If you want ready-to-use request inject patterns for development, continue with [Request Inject Dev Cookbook](./advanced-inject-request-dev-cookbook.md).

## Use Cases

- Password autofill and auto-login: see [Passwordless Login](./advanced-inject-passwordless-login.md).
- CORS/CSP fine tuning: add/remove response headers on specific routes.
- Replace browser file dialog with LazyCat storage flow: see [Auto Intercept With FilePicker](./lazycat-file-picker-auto-intercept.md).
- Hide or modify specific page elements without upstream source changes.
- Advanced routing: dynamic reverse proxy control via `ctx.proxy`.
- Request/response compatibility fixes (headers, WebSocket details, etc.).
- User-scoped persistence with `ctx.persist`.
- Request-level troubleshooting with `ctx.dump`.

## Phase And Runtime

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

## Matching Rules

Matching fields:

- `when`: OR match rules; any matched rule enters candidate set.
- `unless`: OR exclude rules; any matched rule rejects candidate.
- `prefix_domain`: host prefix filter (`<prefix>-...`).
- `auth_required`: default `true`; skip inject when no valid `SAFE_UID`.

Single-rule format:

`<path-pattern>[?<query>][#<hash-pattern>]`

Rule semantics:

- Only suffix `*` is supported (prefix matching); without `*`, match is exact.
- Wildcard rules use strict string-prefix matching. `"/api/*"` has the prefix `"/api/"`, so it matches `"/api/"` and `"/api/users"`, but not `"/api"`.
- Query token supports `key` and `key=value`.
- Query tokens in one rule are AND.
- `#hash` is supported only in `browser`; not supported in `request/response`.

Examples:

- `"/api"`: matches only `/api` exactly.
- `"/api/*"`: matches the `/api/` prefix, but not `/api`.
- `"/api/*?v=2"`: `/api/` prefix + query contains `v=2`.
- `"/#login"`: hash equals `login` (browser only).

To match both the directory root and paths below it, declare the exact rule and wildcard rule in the same `when` list. Rules in `when` use OR semantics:

```yml
when:
  - /api
  - /api/*
```

If you specifically need to exclude the exact `/api` path while matching every other path that starts with `/api`, use `unless`:

```yml
when:
  - /api*
unless:
  - /api
```

This matches `/api/`, `/api/users`, and `/api-v2`, but not `/api`. If you only need directory paths below `/api/`, use `/api/*` directly without `unless`.

## Manifest Example

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

## `do` Syntax

`do` supports two forms:

- short syntax: `do` is a script string (single script entry).
- long syntax: `do` is `[]InjectScriptConfig` (multiple entries with per-script params).

## `ctx` Fields and Helper APIs {#ctx-api}

`inject.ctx` defines the runtime context fields and helper APIs available to inject scripts.

### Common Fields (All Phases)

| Field | Type | Description |
| ---- | ---- | ---- |
| `ctx.id` | `string` | Current inject `id` |
| `ctx.src` | `string` | Current script source (`src`) |
| `ctx.phase` | `string` | Current phase: `browser`/`request`/`response` |
| `ctx.params` | `object` | Resolved script params (after `$persist`) |
| `ctx.safe_uid` | `string` | Platform user ID (`SAFE_UID`) |
| `ctx.request.host` | `string` | Request host |
| `ctx.request.path` | `string` | Request path |
| `ctx.request.raw_query` | `string` | Raw query without `?` |

Notes:

- When `auth_required=false` and no valid login exists, `ctx.safe_uid` can be an empty string.

### `ctx.params` Resolution Rules

`ctx.params` comes from `inject.do[].params`, and the resolved result is always an object.

Static values:

- Values without a `$persist` marker are passed through as-is.

Dynamic values (`$persist`):

- Marker forms: `{ $persist: "<key>" }` or `{ $persist: "<key>", default: <any> }`
- Dynamic resolution applies only when the marker is explicitly used.
- If the persist key exists, use the persisted value.
- If the key is missing and `default` exists, use the default value.
- If the key is missing and no `default` is provided, use `null`.

Resolution timing:

- `browser`: values are resolved again on each runtime trigger, such as page load or route/hash changes.
- `request/response`: values are resolved before each script execution.

Additional constraint:

- If the resolved result is not an object, `ctx.params` becomes `{}`.

### `ctx.request` Field Semantics

Common fields:

| Field | Type | Description |
| ---- | ---- | ---- |
| `ctx.request.host` | `string` | Host without scheme |
| `ctx.request.path` | `string` | Path starting with `/` |
| `ctx.request.raw_query` | `string` | Raw query without `?` |

Phase-specific fields:

| Field | Phase | Type | Description |
| ---- | ---- | ---- | ---- |
| `ctx.request.hash` | `browser` | `string` | URL hash without `#` |
| `ctx.request.method` | `request/response` | `string` | HTTP method in uppercase |

### `ctx.runtime` Fields (`browser`)

| Field | Type | Description |
| ---- | ---- | ---- |
| `ctx.runtime.executedBefore` | `bool` | Whether the script has already executed in the current page lifecycle |
| `ctx.runtime.executionCount` | `int` | Execution count in the current page lifecycle, starting from `1` |
| `ctx.runtime.trigger` | `string` | Trigger source, such as `load` or `hashchange` |

### `ctx.status` Field

| Field | Phase | Type | Description |
| ---- | ---- | ---- | ---- |
| `ctx.status` | `response` | `int` | Current response status code |

### Helper Matrix

| Helper | browser | request | response |
| ---- | ---- | ---- | ---- |
| `ctx.base64` | Yes | Yes | Yes |
| `ctx.persist` | Yes | Yes | Yes |
| `ctx.headers` | No | Yes | Yes |
| `ctx.body` | No | Yes | Yes |
| `ctx.flow` | No | Yes | Yes |
| `ctx.fs` | No | Yes | Yes |
| `ctx.client` | No | Yes | Yes |
| `ctx.dev` | No | Yes | Yes |
| `ctx.net` | No | Yes | Yes |
| `ctx.dump` | No | Yes | Yes |
| `ctx.response` | No | Yes | Yes |
| `ctx.proxy` | No | Yes | Yes |

### `ctx.base64`

Used for Base64 encoding and decoding.

- `ctx.base64.encode(text) -> string`
- `ctx.base64.decode(text) -> string`

### `ctx.persist`

Persisted key/value storage isolated by `SAFE_UID`.

request/response:

- `ctx.persist.get(key) -> any`
- `ctx.persist.set(key, value) -> void`
- `ctx.persist.del(key) -> void`
- `ctx.persist.list(prefix?) -> Array<{key: string, value: any}>`

browser (async):

- `ctx.persist.get(key) -> Promise<any | undefined>`
- `ctx.persist.set(key, value) -> Promise<void>`
- `ctx.persist.del(key) -> Promise<void>`
- `ctx.persist.list(prefix?) -> Promise<Array<{key: string, value: any}>>`

Constraints:

- `list` returns all results sorted by key in ascending order.
- `ctx.safe_uid` must be non-empty to access `ctx.persist`.
- `key` and `prefix` are trimmed. An empty `key` cannot be used for `get`, `set`, or `del`.
- Values passed to `set` must be JSON-serializable.
- No additional application-layer encryption is provided.

### `ctx.headers` (`request/response`)

Used to read and modify HTTP headers.

- `ctx.headers.get(name) -> string`
- `ctx.headers.getValues(name) -> string[]`
- `ctx.headers.getAll() -> Record<string, string[]>`
- `ctx.headers.set(name, value) -> void`
- `ctx.headers.add(name, value) -> void`
- `ctx.headers.del(name) -> void`

Notes:

- `ctx.headers.set(name, null)` or `ctx.headers.set(name, undefined)` deletes the header.
- `ctx.headers.set(name, array)` deletes existing values first, then adds each array item as a separate header value.
- `ctx.headers.add(name, value)` appends one stringified value. `null` and `undefined` are ignored.

### `ctx.body` (`request/response`)

Used to read and modify the request or response body.

- `ctx.body.getText(opts?) -> string`
- `ctx.body.getJSON(opts?) -> any`
- `ctx.body.getForm(opts?) -> Record<string, string[]>`
- `ctx.body.set(body, opts?) -> void`

`opts`:

| Field | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `max_bytes` | `int` | `1048576` | Maximum bytes read by `get*` methods |
| `content_type` | `string` | empty | Override `Content-Type` when calling `set` |

Notes:

- `ctx.body.set(...)` updates `Content-Length` and clears `Content-Encoding` and `ETag`.
- String values are written as-is, `null` and `undefined` produce an empty body, and other values are JSON-encoded before writing.

### `ctx.flow` (`request/response`)

Temporary state shared between the request and response phases of the same request.

- `ctx.flow.get(key) -> any`
- `ctx.flow.set(key, value) -> void`
- `ctx.flow.del(key) -> void`
- `ctx.flow.list(prefix?) -> Array<{key: string, value: any}>`

Constraints:

- `key` and `prefix` are trimmed. An empty `key` cannot be used for `get`, `set`, or `del`.
- Values passed to `set` must be JSON-serializable.
- `list` returns all results sorted by key in ascending order.

### `ctx.fs` (`request/response`)

Used to read container filesystem state.

- `ctx.fs.exists(path) -> bool`
- `ctx.fs.readText(path, opts?) -> string`
- `ctx.fs.readJSON(path, opts?) -> any`
- `ctx.fs.stat(path) -> object`
- `ctx.fs.list(path) -> string[]`

Parameter constraints:

- `path` must be absolute.
- `ctx.fs.readText(...)` and `ctx.fs.readJSON(...)` read at most `max_bytes` bytes and throw an error when the file exceeds the limit.
- `ctx.fs.readJSON(...)` parses the file content as JSON.
- `ctx.fs.list(...)` returns direct child names only, without parent paths, sorted by name in ascending order.

`opts`:

| Field | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `max_bytes` | `int` | `1048576` | Maximum bytes read by `readText` or `readJSON` |

`ctx.fs.stat(path)` returns:

| Field | Type | Description |
| ---- | ---- | ---- |
| `is_file` | `bool` | Whether the path is a regular file |
| `is_dir` | `bool` | Whether the path is a directory |
| `size` | `int` | File size in bytes |
| `mod_time_unix` | `int` | Modification time as a Unix timestamp in seconds |
| `mode` | `int` | File mode value |

### `ctx.client` (`request/response`)

Used to read the current client context.

- `ctx.client.id -> string`
- `ctx.client.id` comes from the current client identity injected by ingress. It may be empty when no client context is attached.

### `ctx.dev` (`request/response`)

Used to read the development machine identity and cached online state maintained by lzcinit.

- `ctx.dev.id -> string`
- `ctx.dev.online() -> bool`

Notes:

- `ctx.dev.id` is currently read from `/lzcapp/var/_lzc_ext/dev.id`.
- `ctx.dev.online()` reads cached state only. lzcinit refreshes the cache in the background for the current request UID.

### `ctx.net` (`request/response`)

Used to construct network addresses, describe network paths, and probe TCP reachability.

- `ctx.net.joinHost(host, port) -> string`
- `ctx.net.via.local() -> object`
- `ctx.net.via.host() -> object`
- `ctx.net.via.client(id) -> object`
- `ctx.net.reachable(protocol, host, port, via?) -> bool`

Notes:

- `protocol` currently supports `tcp`, `tcp4`, and `tcp6`.
- `host` accepts a container-reachable hostname or an IP literal.
- `ctx.net.via.local()` returns `{ type: "local" }`, which represents the current container network.
- `ctx.net.via.host()` accesses the lzcos host network through remotesocket.
- `ctx.net.via.client(id)` accesses a specific client node network through remotesocket.
- `reachable(...)` performs a live network probe with a default timeout of about `1200ms`.
- `via` is optional. When omitted, the current container network is used.

### `ctx.dump` (`request/response`)

Used to return the current request or response content for troubleshooting.

- `ctx.dump.request(opts?) -> string`
- `ctx.dump.response(opts?) -> string`

Use `console.log(...)` to print ordinary debugging information. Browser-phase output appears in the browser console, while request/response-phase output appears in the lzcapp runtime log. `ctx.dump` returns a string, so you can combine them:

```js
console.log(ctx.dump.request());
```

`opts`:

| Field | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `include_body` | `bool` | `false` | Include body text |
| `max_body_bytes` | `int` | `4096` | Maximum bytes included from the body |

### `ctx.response` (`request/response`)

Used to construct or replace the response and short-circuit upstream handling.

- `ctx.response.send(status, body?, opts?) -> void`

`opts`:

| Field | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `headers` | `object` | empty | Additional response headers |
| `content_type` | `string` | `text/html; charset=utf-8` | `Content-Type` override |
| `location` | `string` | empty | Redirect location, required for `301/302/303/307/308` |

Notes:

- `headers` values can be single values or arrays. Arrays add multiple values for the same header.
- Header fields with `null` values are not written.

### `ctx.proxy` (`request/response`)

Used to rewrite the reverse-proxy target for the current request.

- `ctx.proxy.to(url, opts?) -> void`

`opts`:

| Field | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `use_target_host` | `bool` | `false` | Rewrite `Host` to the target host |
| `timeout_ms` | `int` | `5000` | Per-request proxy timeout in milliseconds |
| `path` | `string` | empty | Optional path rewrite |
| `query` | `string` | empty | Optional query rewrite without `?` |
| `via` | `object` | empty | Optional network path, usually from `ctx.net.via.local()`, `ctx.net.via.host()`, or `ctx.net.via.client(id)` |
| `on_fail` | `string` | `keep_original` | Failure policy: `keep_original` or `error` |

Notes:

- `url` must include a scheme and host.
- If `path` is not set, the target URL path is preferred. If the target URL has no path, the original request path is retained.
- If `query` is not set, the target URL query is preferred. If the target URL has no query, the original request query is retained.

### Execution Model Constraints

- `request/response` phases are synchronous and do not support `Promise` or `async`.
- `browser` can use asynchronous APIs such as the `ctx.persist` Promise methods.

## Built-in Scripts

Most commonly used built-in script:

- `builtin://simple-inject-password`

For a complete walkthrough:

- [Passwordless Login](./advanced-inject-passwordless-login.md)

## Validation And Troubleshooting

Recommended workflow:

1. Start with a minimal short-syntax script (for example `console.log`) to verify matching.
2. Add one behavior helper (`ctx.headers` or `ctx.body`) for single-point verification.
3. Then introduce `ctx.flow` + `ctx.persist` for cross-phase coordination.

Common mistakes:

- Using `#hash` rule in `on=request/response`.
- Expecting inject to run without `SAFE_UID` while `auth_required=true`.
- Calling `ctx.body.getJSON()` on non-JSON payload without error handling.
