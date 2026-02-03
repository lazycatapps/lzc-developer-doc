脚本注入（injects）
==================

概述
====

`injects` 用于在指定路径的 HTML 页面中注入脚本，适合第三方应用最小侵入适配。此功能需要 lzcos 1.5.0+。

匹配规则
========

- `paths` 为空：匹配所有路径
- `paths` 不为空：任意前缀匹配即可
- 命中后如再匹配 `exclude` 任一前缀，则不注入
- `prefix_domain` 不为空时，仅匹配域名前缀为 `<prefix>-` 的请求
- `injects` 条目按声明顺序执行；每个条目内 `scripts` 也按顺序注入

脚本来源
========

`scripts[].src` 支持以下形式：
- `builtin://name` 使用 lzcinit 内置脚本
- `file:///path` 加载应用文件系统内脚本（通常在 `/lzcapp/pkg/content/`）
- `http(s)://...` 远程脚本（建议仅用于调试）

参数注入
========

`scripts[].params` 会以闭包参数注入到脚本中，脚本内读取 `__LZC_INJECT_PARAMS__` 即可。

示例（脚本侧）：
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

使用建议
========

- 强烈建议将 `paths` 精确限定在登录页等必要路径
- 对 API 或静态资源路径使用 `exclude` 避免误注入
- 远程脚本仅建议调试使用，正式发布建议改为 `builtin://` 或 `file://`
- 若页面存在严格 CSP 限制，注入脚本可能无法执行

内置脚本
========

`builtin://hello`
-----------------

打印调试信息。

参数：
- `message`：输出内容，默认 `hello world`

`builtin://simple-inject-password`
----------------------------------

自动填充账号/密码，并可选自动提交。建议仅在明确登录路径下注入。

参数说明（`params`）：
| 参数 | 类型 | 说明 |
| ---- | ---- | ---- |
| `user` | `string` | 账号值 |
| `password` | `string` | 密码值 |
| `requireUser` | `bool` | 是否必须找到账号输入框，默认当 `user` 非空时为 `true` |
| `allowPasswordOnly` | `bool` | 允许仅填充密码，默认 `false` |
| `userSelector` | `string` | 显式指定账号输入框选择器 |
| `passwordSelector` | `string` | 显式指定密码输入框选择器 |
| `formSelector` | `string` | 限定在指定容器内搜索输入框 |
| `submitSelector` | `string` | 显式指定提交按钮选择器 |
| `autoSubmit` | `bool` | 是否自动提交，默认 `true` |
| `submitMode` | `string` | 提交模式：`auto`/`requestSubmit`/`click`/`enter`，默认 `auto` |
| `retryCount` | `int` | 自动提交重试次数，默认 `10` |
| `retryIntervalMs` | `int` | 自动提交重试间隔（毫秒），默认 `300` |
| `observerTimeoutMs` | `int` | MutationObserver 超时（毫秒），默认 `8000` |
| `eventSequence` | `string` 或 `[]string` | 触发事件序列，默认 `input,change,keydown,keyup,blur` |
| `keyValue` | `string` | 触发键盘事件时的按键值，默认 `a` |
| `allowHidden` | `bool` | 允许填充不可见输入框，默认 `false` |
| `allowReadOnly` | `bool` | 允许填充只读输入框，默认 `false` |
| `onlyFillEmpty` | `bool` | 仅当输入框为空时才填充，默认 `false` |
| `allowNewPassword` | `bool` | 允许填充 `autocomplete=new-password` 的密码框，默认 `false` |
| `includeShadowDom` | `bool` | 是否搜索开放的 Shadow DOM，默认 `false` |
| `shadowDomMaxDepth` | `int` | Shadow DOM 最大递归深度，默认 `2` |
| `preferSameForm` | `bool` | 优先选择与密码框同一表单内的账号框，默认 `true` |
| `userKeywords` | `string` 或 `[]string` | 追加账号字段关键词（逗号分隔或数组） |
| `userExcludeKeywords` | `string` 或 `[]string` | 追加账号字段排除关键词 |
| `passwordKeywords` | `string` 或 `[]string` | 追加密码字段关键词 |
| `passwordExcludeKeywords` | `string` 或 `[]string` | 追加密码字段排除关键词 |
| `submitKeywords` | `string` 或 `[]string` | 追加提交按钮关键词 |

示例：
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
