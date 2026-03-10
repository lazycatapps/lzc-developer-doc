inject.ctx
==========

`inject.ctx` defines runtime context fields and helper APIs available to inject scripts.

This page describes interface-level specifications only.

Applicable Phases
=================

- `browser`: script runs in browser runtime.
- `request`: script runs before upstream forwarding.
- `response`: script runs after upstream response.

Common Fields (All Phases)
==========================

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

- When `auth_required=false` and no valid login exists, `ctx.safe_uid` can be empty string.

`ctx.params` Resolution Rules
=============================

Source:

- `ctx.params` comes from `inject.do[].params`.
- Final result is always an object.

Static values:

- Values without `$persist` marker are passed through as-is.

Dynamic values (`$persist`):

- Marker forms: `{ $persist: "<key>" }` or `{ $persist: "<key>", default: <any> }`
- Dynamic resolution applies only when marker is explicitly used.
- If persist key exists, use persisted value.
- If key missing and `default` exists, use default.
- If key missing and no `default`, use `null`.

Resolution timing:

- `browser`: re-resolved on each runtime trigger (page load, route/hash changes, etc.).
- `request/response`: re-resolved before each script execution.

Fallback:

- If resolved params is not an object, `ctx.params` becomes `{}`.

`ctx.request` Field Semantics
=============================

Common fields:

| Field | Type | Description |
| ---- | ---- | ---- |
| `ctx.request.host` | `string` | Host without scheme |
| `ctx.request.path` | `string` | Path (starts with `/`) |
| `ctx.request.raw_query` | `string` | Raw query without `?` |

Phase-specific fields:

| Field | Phase | Type | Description |
| ---- | ---- | ---- | ---- |
| `ctx.request.hash` | `browser` | `string` | URL hash without `#` |
| `ctx.request.method` | `request/response` | `string` | HTTP method in uppercase |

`ctx.runtime` Fields (`browser`)
================================

| Field | Type | Description |
| ---- | ---- | ---- |
| `ctx.runtime.executedBefore` | `bool` | Whether executed before in current page lifecycle |
| `ctx.runtime.executionCount` | `int` | Execution count in current page lifecycle (starts from `1`) |
| `ctx.runtime.trigger` | `string` | Trigger source (for example `load`, `hashchange`) |

`ctx.status` Field
==================

| Field | Phase | Type | Description |
| ---- | ---- | ---- | ---- |
| `ctx.status` | `response` | `int` | Current response status code |

Helper Matrix
=============

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

`ctx.base64`
============

- `ctx.base64.encode(text) -> string`
- `ctx.base64.decode(text) -> string`

`ctx.persist`
=============

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

- `list` returns full results sorted by key (ascending).
- No extra app-layer encryption is provided.

`ctx.headers` (`request/response`)
==================================

- `ctx.headers.get(name) -> string`
- `ctx.headers.getValues(name) -> string[]`
- `ctx.headers.getAll() -> Record<string, string[]>`
- `ctx.headers.set(name, value) -> void`
- `ctx.headers.add(name, value) -> void`
- `ctx.headers.del(name) -> void`

`ctx.body` (`request/response`)
===============================

- `ctx.body.getText(opts?) -> string`
- `ctx.body.getJSON(opts?) -> any`
- `ctx.body.getForm(opts?) -> Record<string, string | string[]>`
- `ctx.body.set(body, opts?) -> void`

`opts`:

| Field | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `max_bytes` | `int` | `1048576` | Max bytes for `get*` read |
| `content_type` | `string` | empty | Override `Content-Type` on `set` |

Notes:

- `ctx.body.set(...)` updates `Content-Length` and clears `Content-Encoding` and `ETag`.

`ctx.flow` (`request/response`)
===============================

- `ctx.flow.get(key) -> any`
- `ctx.flow.set(key, value) -> void`
- `ctx.flow.del(key) -> void`
- `ctx.flow.list(prefix?) -> Array<{key: string, value: any}>`

`ctx.fs` (`request/response`)
=============================

- `ctx.fs.exists(path) -> bool`
- `ctx.fs.readText(path, opts?) -> string`
- `ctx.fs.readJSON(path, opts?) -> any`
- `ctx.fs.stat(path) -> object`
- `ctx.fs.list(path) -> string[]`

`ctx.client` (`request/response`)
=================================

- `ctx.client.id -> string`
- `ctx.client.id` comes from the current client identity injected by ingress. It may be empty when no client context is attached.

`ctx.dev` (`request/response`)
===============================

- `ctx.dev.id -> string`
- `ctx.dev.online() -> bool`

Notes:

- `ctx.dev.id` is currently read from `/lzcapp/var/_lzc_ext/dev.id`.
- `ctx.dev.online()` reads cached status only. The cache is refreshed in background by lzcinit for the current request UID.

`ctx.net` (`request/response`)
===============================

- `ctx.net.joinHost(host, port) -> string`
- `ctx.net.via.host() -> object`
- `ctx.net.via.client(id) -> object`
- `ctx.net.reachable(protocol, host, port, via?) -> bool`

Notes:

- `protocol` currently supports `tcp`, `tcp4`, and `tcp6`.
- `host` accepts either a container-reachable hostname or an IP literal.
- `ctx.net.via.host()` means accessing the lzcos host network through remotesocket.
- `ctx.net.via.client(id)` means accessing a specific client node network through remotesocket.
- `reachable(...)` performs a live network probe with a default timeout of about `1200ms`.
- `via` is optional; when omitted, the current container network is used.

`ctx.dump` (`request/response`)
===============================

- `ctx.dump.request(opts?) -> string`
- `ctx.dump.response(opts?) -> string`

`opts`:

| Field | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `include_body` | `bool` | `false` | Include body text |
| `max_body_bytes` | `int` | `4096` | Max bytes for dumped body |

`ctx.response` (`request/response`)
===================================

- `ctx.response.send(status, body?, opts?) -> void`

`opts`:

| Field | Type | Description |
| ---- | ---- | ---- |
| `headers` | `object` | Additional response headers |
| `content_type` | `string` | `Content-Type` override |
| `location` | `string` | Redirect location (required for `301/302/303/307/308`) |

`ctx.proxy` (`request/response`)
================================

- `ctx.proxy.to(url, opts?) -> void`

`opts`:

| Field | Type | Description |
| ---- | ---- | ---- |
| `use_target_host` | `bool` | Rewrite `Host` to target host |
| `timeout_ms` | `int` | Per-request proxy timeout |
| `path` | `string` | Optional path rewrite |
| `query` | `string` | Optional query rewrite without `?` |
| `via` | `object` | Optional network path object, usually from `ctx.net.via.host()` or `ctx.net.via.client(id)` |
| `on_fail` | `string` | Failure policy: `keep_original` or `error` |

Execution Model Constraints
===========================

- `request/response` phases are synchronous (no `Promise` / `async` support).
- `browser` can use async APIs (for example `ctx.persist` Promise methods).
