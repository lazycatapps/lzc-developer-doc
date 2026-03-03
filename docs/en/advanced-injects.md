Script Injection (injects)
=========================

Overview
========

`injects` injects scripts into HTML pages when URL rules match. It is designed for minimal adaptation of third-party apps. Requires lzcos 1.5.0+.
For field definitions, see [manifest.md#injects](./spec/manifest.md#injects). This page focuses on runtime behavior and practical usage.

Quick Example
=============

```yml
application:
  injects:
    - id: login-autofill
      include:
        - "/"
        - "/?version=1.2&channel=stable"
        - "/#login"
      scripts:
        - src: builtin://simple-inject-password
          params:
            user: "admin"
            password: "admin123"
```

Rule Model
==========

- `include`: allowlist rules, any match enters candidate set
- `exclude`: denylist rules, any match rejects injection
- `mode`: `exact` or `prefix`, default is `exact`, applied to `path/hash`
- `prefix_domain`: if set, only hosts with `<prefix>-` are matched
- `injects` entries run in order; scripts inside each entry also run in order

Rule Syntax
===========

Single rule format:

`<path>[?<query>][#<hash>]`

Examples:

- `"/"`
- `"/?version=1.2"`
- `"/#login"`
- `"/app?version=1.2&channel=stable#signin"`

Parsing notes:

- `path` is required and must start with `/`
- query token supports two forms:
  - `key`: key must exist
  - `key=value`: key must contain at least one matching value
- query tokens in one rule are AND
- query uses contains semantics: extra params are allowed

Matching Semantics
==================

Overall logic:

- `include` is OR: any matched rule is enough
- `exclude` is OR: any matched rule rejects
- final result: `matched = includeMatched && !excludeMatched`

Single rule logic (AND):

- `path` matches
- and `query` matches (if declared)
- and `hash` matches (if declared)

`mode` semantics (`path/hash`):

- `exact`: full equality match
- `prefix`: prefix match

Hash Behavior (hard/soft)
=========================

- `path/query` are server-visible conditions (hard matching)
- `hash` is not server-visible and is treated as a client-side soft condition

This means:

- server decides whether to inject wrapper by `path/query`
- wrapper evaluates full rule (including `hash`) in browser
- wrapper may be injected while script does not run due to hash mismatch; this is expected

Execution Timing And Runtime Object
===================================

Wrapper triggers:

1. run one evaluation after page load (`trigger=load`)
2. listen `hashchange` and re-evaluate on each change (`trigger=hashchange`)
3. execute script whenever matched; no built-in deduplication

Runtime objects in script:

- `__LZC_INJECT_PARAMS__`: values from `scripts[].params`
- `__LZC_INJECT_RUNTIME__`:
  - `executedBefore`: whether this script has already run in current page lifecycle
  - `executionCount`: current execution count (starts from `1`)
  - `trigger`: `load` or `hashchange`

Example (script side):

```js
(() => {
  const runtime = __LZC_INJECT_RUNTIME__ || {};
  if (runtime.executedBefore) {
    return;
  }
  const params = __LZC_INJECT_PARAMS__ || {};
  console.log("inject params:", params);
})();
```

Script Sources
==============

`scripts[].src` supports:

- `builtin://name`: built-in scripts from lzcinit
- `file:///path`: scripts from app filesystem (common path: `/lzcapp/pkg/content/`)
- `http(s)://...`: remote scripts (debug only recommendation)

Remote scripts use conditional caching (`ETag`/`Last-Modified`).

Built-in Scripts
================

`builtin://hello`
-----------------

Prints a debug message.

Params:

- `message`: output content, default `hello world`

`builtin://simple-inject-password`
----------------------------------

Auto-fills username/password and can auto-submit. Use only on explicit login pages.

Params (`params`):

| Name | Type | Description |
| ---- | ---- | ---- |
| `user` | `string` | Username value, default empty |
| `password` | `string` | Password value, default empty |
| `requireUser` | `bool` | Require username field; default logic: `false` when `allowPasswordOnly=true`, otherwise `true` if `user` is non-empty |
| `allowPasswordOnly` | `bool` | Allow password-only fill, default `false` |
| `autoSubmit` | `bool` | Auto submit, default `true` |
| `submitMode` | `string` | Submit mode: `auto`/`requestSubmit`/`click`/`enter`, default `auto` |
| `submitDelayMs` | `int` | Delay before auto-submit (ms), default `50`, minimum `0` |
| `retryCount` | `int` | Auto-submit retry count, default `10` |
| `retryIntervalMs` | `int` | Auto-submit retry interval (ms), default `300` |
| `observerTimeoutMs` | `int` | DOM/state observation timeout (ms), default `8000` |
| `debug` | `bool` | Enable debug log, default `false` |
| `userSelector` | `string` | Explicit selector for username input |
| `passwordSelector` | `string` | Explicit selector for password input |
| `formSelector` | `string` | Limit search scope to a container |
| `submitSelector` | `string` | Explicit selector for submit button |
| `allowHidden` | `bool` | Allow hidden input fields, default `false` |
| `allowReadOnly` | `bool` | Allow read-only input fields, default `false` |
| `onlyFillEmpty` | `bool` | Fill only empty fields, default `false` |
| `allowNewPassword` | `bool` | Allow `autocomplete=new-password` fields, default `false` |
| `includeShadowDom` | `bool` | Search open Shadow DOM, default `false` |
| `shadowDomMaxDepth` | `int` | Max Shadow DOM recursion depth, default `2` |
| `preferSameForm` | `bool` | Prefer username field in same form as password, default `true` |
| `eventSequence` | `string` or `[]string` | Event sequence after filling, default `input,change,keydown,keyup,blur` |
| `keyValue` | `string` | Key value for keyboard events, default `a` |
| `userKeywords` | `string` or `[]string` | Extra username keywords |
| `userExcludeKeywords` | `string` or `[]string` | Extra username exclude keywords |
| `passwordKeywords` | `string` or `[]string` | Extra password keywords |
| `passwordExcludeKeywords` | `string` or `[]string` | Extra password exclude keywords |
| `submitKeywords` | `string` or `[]string` | Extra submit button keywords |

Best Practices
==============

- For multiple target pages, add multiple `include` rules instead of loosening one rule
- For login redirect cases, use query constraints directly, for example `"/?version=1.2&channel=stable"`
- For hash-routing apps, use `__LZC_INJECT_RUNTIME__.executedBefore` to decide whether to rerun
- Strongly recommend passing username/password via deployment parameters instead of hardcoding weak credentials in source or manifest
- Non-HTML responses are never injected; `exclude` is mainly for narrowing HTML page scope further (for example `/admin/debug`)
- Remote scripts are recommended for debugging only; use `builtin://` or `file://` for release
