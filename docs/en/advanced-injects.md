Script Injection (injects)
=========================

Overview
========

`injects` allows injecting scripts into HTML pages at specific paths. It is designed for minimal adaptation of third-party apps. Requires lzcos 1.5.0+.

Matching Rules
==============

- If `paths` is empty: match all paths
- If `paths` is not empty: any prefix match is enough
- If a matched path also matches any prefix in `exclude`, injection is skipped
- If `prefix_domain` is set: only match hosts whose prefix is `<prefix>-`
- `injects` entries run in order; `scripts` inside each entry also run in order

Script Sources
==============

`scripts[].src` supports:
- `builtin://name` Built-in scripts from lzcinit
- `file:///path` Scripts from the app filesystem (usually under `/lzcapp/pkg/content/`)
- `http(s)://...` Remote scripts (recommended for debugging only)

Parameter Injection
===================

`scripts[].params` is injected as a closure parameter. Access it via `__LZC_INJECT_PARAMS__` inside the script.

Example (script side):
```js
(() => {
  const params = __LZC_INJECT_PARAMS__ || {};
  const user = params.user || "";
  const password = params.password || "";
  if (user) {
    console.log("user:", user);
  }
})();
```

Usage Tips
==========

- Strongly recommend limiting `paths` to login pages or specific routes
- Use `exclude` for API or static resource paths to avoid accidental injection
- Remote scripts should be used for debugging only; release builds should use `builtin://` or `file://`
- If the page has strict CSP, injected scripts may not execute

Built-in Scripts
===============

`builtin://hello`
-----------------

Prints a debug message.

Params:
- `message`: output content, default `hello world`

`builtin://simple-inject-password`
----------------------------------

Auto-fills username/password and optionally auto-submits. Recommended only for explicit login paths.

Params (`params`):
| Name | Type | Description |
| ---- | ---- | ---- |
| `user` | `string` | Username value |
| `password` | `string` | Password value |
| `requireUser` | `bool` | Whether a username field is required. Defaults to `true` when `user` is non-empty |
| `allowPasswordOnly` | `bool` | Allow password-only fill. Default `false` |
| `userSelector` | `string` | Explicit selector for username field |
| `passwordSelector` | `string` | Explicit selector for password field |
| `formSelector` | `string` | Limit field search to a specific container |
| `submitSelector` | `string` | Explicit selector for submit button |
| `autoSubmit` | `bool` | Auto submit after fill. Default `true` |
| `submitMode` | `string` | Submit mode: `auto`/`requestSubmit`/`click`/`enter`, default `auto` |
| `retryCount` | `int` | Auto-submit retry count, default `10` |
| `retryIntervalMs` | `int` | Auto-submit retry interval (ms), default `300` |
| `observerTimeoutMs` | `int` | MutationObserver timeout (ms), default `8000` |
| `eventSequence` | `string` or `[]string` | Event sequence, default `input,change,keydown,keyup,blur` |
| `keyValue` | `string` | Key value used for keyboard events, default `a` |
| `allowHidden` | `bool` | Allow filling hidden fields, default `false` |
| `allowReadOnly` | `bool` | Allow filling read-only fields, default `false` |
| `onlyFillEmpty` | `bool` | Only fill when field is empty, default `false` |
| `allowNewPassword` | `bool` | Allow filling `autocomplete=new-password` fields, default `false` |
| `includeShadowDom` | `bool` | Search open Shadow DOM, default `false` |
| `shadowDomMaxDepth` | `int` | Shadow DOM max recursion depth, default `2` |
| `preferSameForm` | `bool` | Prefer username in the same form as password, default `true` |
| `userKeywords` | `string` or `[]string` | Extra username keywords |
| `userExcludeKeywords` | `string` or `[]string` | Extra username exclude keywords |
| `passwordKeywords` | `string` or `[]string` | Extra password keywords |
| `passwordExcludeKeywords` | `string` or `[]string` | Extra password exclude keywords |
| `submitKeywords` | `string` or `[]string` | Extra submit button keywords |

Example:
```yml
application:
  injects:
    - id: login-autofill
      paths:
        - /login
      scripts:
        - src: builtin://simple-inject-password
          params:
            user: "admin"
            password: "admin123"
            autoSubmit: true
            submitMode: "auto"
            userSelector: "#username"
            passwordSelector: "#password"
            submitKeywords: "login,signin,continue"
```
