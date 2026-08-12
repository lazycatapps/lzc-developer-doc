# 脚本注入（injects）

## 概述

`injects` 用于在不修改 OCI image 或应用源码的前提下，按规则注入脚本，覆盖浏览器行为、请求行为和响应行为。
字段定义见 [manifest.md#injects](./spec/manifest.md#injects)。本文集中说明匹配与执行机制、`ctx` API、调试方式和实践建议。
如果你要直接落地开发态 request inject 模板，继续看 [inject request 开发态 Cookbook](./advanced-inject-request-dev-cookbook.md)。

## 适用场景

- 密码填充与自动登录：见 [免密登录](./advanced-inject-passwordless-login.md)。
- CORS/CSP 微调：按路径精确增删响应头，适配 iframe、前端调试等场景。
- 替换浏览器文件对话框到懒猫网盘：见 [自动拦截文件选择器](./lazycat-file-picker-auto-intercept.md)。
- 隐藏或修改部分页面元素：在不改上游源码的前提下做 UI 适配和运营开关。
- 高级路由：在 request/response 阶段结合 `ctx.proxy` 做动态反向代理。
- 请求头/响应头兼容修正：例如补充鉴权头、修正 WebSocket 相关头、清理冲突头。
- 按用户持久化行为：通过 `ctx.persist` 保存用户侧配置，跨请求复用。
- 请求级诊断与排障：用 `ctx.dump` 输出关键请求/响应信息，快速定位问题。

## 阶段与执行环境

每个 inject 只属于一个阶段：

- `on=browser`：脚本在应用页面真实浏览器环境执行。
- `on=request`：脚本在 lzcinit 沙盒中执行，时机是请求转发到 upstream 前。
- `on=response`：脚本在 lzcinit 沙盒中执行，时机是收到 upstream 响应后。

执行顺序：

- 先按 `application.injects` 的声明顺序。
- 再按同一 inject 的 `do[]` 声明顺序。
- 命中策略是 `all-match-run`，即同阶段所有命中 inject 都执行。

中断行为：

- `request/response` 阶段里，`ctx.response.send(...)` 或 `ctx.proxy.to(...)` 生效后立即短路，停止当前阶段后续脚本。
- 任一脚本报错，当前阶段立即终止并返回错误。

## 匹配规则

匹配字段：

- `when`：命中条件（OR），任意一条命中即可进入候选。
- `unless`：排除条件（OR），任意一条命中即排除。
- `prefix_domain`：仅匹配 `<prefix>-` 前缀域名请求。
- `auth_required`：默认 `true`。请求没有合法 `SAFE_UID` 时跳过当前 inject。

单条规则格式：

`<path-pattern>[?<query>][#<hash-pattern>]`

规则语义：

- 仅支持后缀 `*` 作为前缀匹配；无 `*` 时为精确匹配。
- 通配规则采用严格的字符串前缀匹配。`"/api/*"` 的匹配前缀是 `"/api/"`，因此匹配 `"/api/"` 和 `"/api/users"`，但不匹配 `"/api"`。
- `query` token 支持 `key` 或 `key=value`，单条规则内为 AND。
- `#hash` 仅 browser 阶段支持，request/response 阶段不支持 hash 规则。

示例：

- `"/api"`：仅精确匹配 `/api`。
- `"/api/*"`：匹配 `/api/` 前缀，但不匹配 `/api`。
- `"/api/*?v=2"`：匹配 `/api/` 前缀且 query 包含 `v=2`。
- `"/#login"`：匹配 hash 为 `login`（仅 browser）。

如果需要同时匹配目录根路径和目录下路径，在同一个 `when` 中分别声明精确规则和通配规则。`when` 中的规则是 OR 关系：

```yml
when:
  - /api
  - /api/*
```

如果确实需要排除精确路径 `/api`，但匹配其他所有以 `/api` 开头的路径，可以使用 `unless`：

```yml
when:
  - /api*
unless:
  - /api
```

这会匹配 `/api/`、`/api/users` 和 `/api-v2`，但不匹配 `/api`。如果只需要匹配 `/api/` 下的目录子路径，应直接使用 `/api/*`，无需配置 `unless`。

## 清单示例

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

## `do` 写法

`do` 支持两种写法：

- short syntax：`do` 直接写脚本字符串（只对应一条脚本）。
- long syntax：`do` 写 `[]InjectScriptConfig`（可配置多条脚本与 `params`）。

## `ctx` 字段与 helper API {#ctx-api}

`inject.ctx` 定义了 inject 脚本运行时可访问的上下文字段和 helper API。

### 通用字段（所有阶段）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `ctx.id` | `string` | 当前 inject 的 `id` |
| `ctx.src` | `string` | 当前脚本来源（`src`） |
| `ctx.phase` | `string` | 当前阶段：`browser`/`request`/`response` |
| `ctx.params` | `object` | 当前脚本参数（已完成 `$persist` 解析） |
| `ctx.safe_uid` | `string` | 当前请求对应的平台用户 ID（`SAFE_UID`） |
| `ctx.request.host` | `string` | 请求 host |
| `ctx.request.path` | `string` | 请求 path |
| `ctx.request.raw_query` | `string` | 原始 query（不带 `?`） |

补充说明：

- 当 `auth_required=false` 且请求没有合法登录态时，`ctx.safe_uid` 可能为空字符串。

### `ctx.params` 解析规则

`ctx.params` 的源是 `inject.do[].params`，解析结果始终为对象。

静态值：

- 未使用 `$persist` 标记的值，按清单原值透传。

动态值（`$persist`）：

- 标记格式：`{ $persist: "<key>" }` 或 `{ $persist: "<key>", default: <any> }`
- 仅当参数值显式使用 `$persist` 标记时触发动态解析。
- 命中持久值时返回持久值。
- 未命中且配置 `default` 时返回 `default`。
- 未命中且未配置 `default` 时返回 `null`。

阶段解析时机：

- `browser`：页面加载/路由变化再次触发脚本时，按当时请求上下文重新解析。
- `request/response`：每次命中并执行脚本前，按当次请求上下文重新解析。

额外约束：

- 解析后若结果不是对象，`ctx.params` 按空对象 `{}` 处理。

### `ctx.request` 字段语义

通用字段（所有阶段）：

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `ctx.request.host` | `string` | host（不含协议） |
| `ctx.request.path` | `string` | path（以 `/` 开头） |
| `ctx.request.raw_query` | `string` | 原始 query（不带 `?`） |

阶段扩展：

| 字段 | 阶段 | 类型 | 说明 |
| ---- | ---- | ---- | ---- |
| `ctx.request.hash` | `browser` | `string` | URL hash（不带 `#`） |
| `ctx.request.method` | `request/response` | `string` | 请求方法（大写） |

### `ctx.runtime` 字段语义（browser）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `ctx.runtime.executedBefore` | `bool` | 当前页面生命周期内是否执行过 |
| `ctx.runtime.executionCount` | `int` | 当前页面生命周期内执行次数（从 `1` 开始） |
| `ctx.runtime.trigger` | `string` | 本次触发来源（例如 `load`、`hashchange`） |

### `ctx.status` 字段语义

| 字段 | 阶段 | 类型 | 说明 |
| ---- | ---- | ---- | ---- |
| `ctx.status` | `response` | `int` | 当前响应状态码 |

### helper 概览

| helper | browser | request | response |
| ---- | ---- | ---- | ---- |
| `ctx.base64` | 是 | 是 | 是 |
| `ctx.persist` | 是 | 是 | 是 |
| `ctx.headers` | 否 | 是 | 是 |
| `ctx.body` | 否 | 是 | 是 |
| `ctx.flow` | 否 | 是 | 是 |
| `ctx.fs` | 否 | 是 | 是 |
| `ctx.client` | 否 | 是 | 是 |
| `ctx.dev` | 否 | 是 | 是 |
| `ctx.net` | 否 | 是 | 是 |
| `ctx.dump` | 否 | 是 | 是 |
| `ctx.response` | 否 | 是 | 是 |
| `ctx.proxy` | 否 | 是 | 是 |

### `ctx.base64`

用于 Base64 编码/解码。

- `ctx.base64.encode(text) -> string`
- `ctx.base64.decode(text) -> string`

### `ctx.persist`

用于跨请求持久化数据，按 `SAFE_UID` 隔离。

request/response：

- `ctx.persist.get(key) -> any`
- `ctx.persist.set(key, value) -> void`
- `ctx.persist.del(key) -> void`
- `ctx.persist.list(prefix?) -> Array<{key: string, value: any}>`

browser（异步）：

- `ctx.persist.get(key) -> Promise<any | undefined>`
- `ctx.persist.set(key, value) -> Promise<void>`
- `ctx.persist.del(key) -> Promise<void>`
- `ctx.persist.list(prefix?) -> Promise<Array<{key: string, value: any}>>`

约束：

- `list` 返回全量结果，按 key 字典序升序。
- 访问 `ctx.persist` 时要求 `ctx.safe_uid` 非空。
- `key`/`prefix` 会去除首尾空白；空 `key` 不能用于 `get`/`set`/`del`。
- `set` 写入的 `value` 必须可 JSON 序列化。
- 不提供额外应用层加密能力（依赖系统已有加密隧道 + HTTPS）。

### `ctx.headers`（request/response）

用于读取与改写 HTTP 头。

- `ctx.headers.get(name) -> string`
- `ctx.headers.getValues(name) -> string[]`
- `ctx.headers.getAll() -> Record<string, string[]>`
- `ctx.headers.set(name, value) -> void`
- `ctx.headers.add(name, value) -> void`
- `ctx.headers.del(name) -> void`

补充：

- `ctx.headers.set(name, null)` 或 `ctx.headers.set(name, undefined)` 等价于删除该 header。
- `ctx.headers.set(name, array)` 会先删除原 header，再按数组元素添加多个同名 header。
- `ctx.headers.add(name, value)` 追加单个 header 值，`value` 会转换为字符串；`null`/`undefined` 不追加。

### `ctx.body`（request/response）

用于读取与改写请求/响应 body。

- `ctx.body.getText(opts?) -> string`
- `ctx.body.getJSON(opts?) -> any`
- `ctx.body.getForm(opts?) -> Record<string, string[]>`
- `ctx.body.set(body, opts?) -> void`

`opts`：

| 字段 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| `max_bytes` | `int` | `1048576` | `get*` 读取 body 的最大字节数 |
| `content_type` | `string` | 空 | `set` 时覆盖 `Content-Type` |

补充：

- `ctx.body.set(...)` 会同步更新 `Content-Length`，并清理 `Content-Encoding` 与 `ETag`。
- `ctx.body.set(body, ...)` 中 `body` 为字符串时按原文写入；为 `null`/`undefined` 时写入空 body；其他类型按 JSON 序列化后写入。

### `ctx.flow`（request/response）

用于同一请求内的 request -> response 临时共享状态。

- `ctx.flow.get(key) -> any`
- `ctx.flow.set(key, value) -> void`
- `ctx.flow.del(key) -> void`
- `ctx.flow.list(prefix?) -> Array<{key: string, value: any}>`

约束：

- `key`/`prefix` 会去除首尾空白；空 `key` 不能用于 `get`/`set`/`del`。
- `set` 写入的 `value` 必须可 JSON 序列化。
- `list` 返回全量结果，按 key 字典序升序。

### `ctx.fs`（request/response）

用于读取容器文件系统状态。

- `ctx.fs.exists(path) -> bool`
- `ctx.fs.readText(path, opts?) -> string`
- `ctx.fs.readJSON(path, opts?) -> any`
- `ctx.fs.stat(path) -> object`
- `ctx.fs.list(path) -> string[]`

参数约束：

- `path` 必须是绝对路径。
- `ctx.fs.readText(...)` 与 `ctx.fs.readJSON(...)` 会按 `max_bytes` 限制读取字节数；超过限制时抛出错误。
- `ctx.fs.readJSON(...)` 会将文件内容按 JSON 解析后返回。
- `ctx.fs.list(...)` 只返回目录下一级条目名称，不包含父路径，按名称升序排序。

`opts`：

| 字段 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| `max_bytes` | `int` | `1048576` | `readText`/`readJSON` 读取文件的最大字节数 |

`ctx.fs.stat(path)` 返回对象：

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `is_file` | `bool` | 是否为普通文件 |
| `is_dir` | `bool` | 是否为目录 |
| `size` | `int` | 文件大小，单位为字节 |
| `mod_time_unix` | `int` | 修改时间，Unix 秒级时间戳 |
| `mode` | `int` | 文件模式数值 |

### `ctx.client`（request/response）

用于读取当前访问客户端上下文。

- `ctx.client.id -> string`
- `ctx.client.id` 来源于 Ingress 注入的当前客户端标识；请求不带客户端上下文时可能为空字符串。

### `ctx.dev`（request/response）

用于读取开发机标识与 lzcinit 维护的缓存在线状态。

- `ctx.dev.id -> string`
- `ctx.dev.online() -> bool`

补充：

- `ctx.dev.id` 当前从 `/lzcapp/var/_lzc_ext/dev.id` 读取。
- `ctx.dev.online()` 只读取缓存状态；缓存由 lzcinit 按当前请求 UID 在后台刷新。

### `ctx.net`（request/response）

用于拼接网络地址、描述网络路径与实时探测 TCP 可达性。

- `ctx.net.joinHost(host, port) -> string`
- `ctx.net.via.local() -> object`
- `ctx.net.via.host() -> object`
- `ctx.net.via.client(id) -> object`
- `ctx.net.reachable(protocol, host, port, via?) -> bool`

补充：

- `protocol` 当前支持 `tcp`、`tcp4`、`tcp6`。
- `host` 支持容器可达 hostname 或 IP 字面量。
- `ctx.net.via.local()` 返回 `{ type: "local" }`，表示使用当前容器网络。
- `ctx.net.via.host()` 表示通过 remotesocket 访问 lzcos host network。
- `ctx.net.via.client(id)` 表示通过 remotesocket 访问指定客户端节点 network。
- `reachable(...)` 为实时网络探测，默认超时约 `1200ms`。
- `via` 可省略；省略时沿用当前容器内默认网络拨号。

### `ctx.dump`（request/response）

用于输出当前请求/响应内容（调试与排障）。

- `ctx.dump.request(opts?) -> string`
- `ctx.dump.response(opts?) -> string`

需要打印普通调试内容时，可以直接使用 `console.log(...)`。browser 阶段的内容输出到浏览器控制台，request/response 阶段的内容输出到 lzcapp 运行日志。`ctx.dump` 返回字符串，如需写入日志可以组合使用：

```js
console.log(ctx.dump.request());
```

`opts`：

| 字段 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| `include_body` | `bool` | `false` | 是否包含 body |
| `max_body_bytes` | `int` | `4096` | body dump 的最大字节数 |

### `ctx.response`（request/response）

用于直接构造/覆盖响应（短路返回）。

- `ctx.response.send(status, body?, opts?) -> void`

`opts`：

| 字段 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| `headers` | `object` | 空 | 附加响应头 |
| `content_type` | `string` | `text/html; charset=utf-8` | 设置 `Content-Type` |
| `location` | `string` | 空 | 重定向地址（`301/302/303/307/308` 必须提供） |

补充：

- `headers` 的字段值可以是单值或数组；数组会添加多个同名 header。
- `headers` 中值为 `null` 的字段不会写入响应头。

### `ctx.proxy`（request/response）

用于按请求级别改写反代目标。

- `ctx.proxy.to(url, opts?) -> void`

`opts`：

| 字段 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| `use_target_host` | `bool` | `false` | 是否把 `Host` 改为目标 host |
| `timeout_ms` | `int` | `5000` | 本次代理超时，单位为毫秒 |
| `path` | `string` | 空 | 可选重写 path |
| `query` | `string` | 空 | 可选重写 query（不带 `?`） |
| `via` | `object` | 空 | 可选网络路径对象，通常来自 `ctx.net.via.local()`、`ctx.net.via.host()` 或 `ctx.net.via.client(id)` |
| `on_fail` | `string` | `keep_original` | 失败策略：`keep_original` 或 `error` |

补充：

- `url` 必须包含 scheme 和 host。
- 未设置 `path` 时，优先使用 `url` 中的 path；若 `url` 未提供 path，则沿用原请求 path。
- 未设置 `query` 时，优先使用 `url` 中的 query；若 `url` 未提供 query，则沿用原请求 query。

### 执行模型约束

- `request/response` 阶段为同步执行模型，不支持 `Promise` / `async`。
- `browser` 阶段允许异步（例如 `ctx.persist` Promise 调用）。

## 内置脚本

内置脚本列表和参数说明见：

- [manifest inject 规范](./spec/manifest.md#injects)

当前最常用的是：

- `builtin://simple-inject-password`

完整免密登录专题见：

- [免密登录](./advanced-inject-passwordless-login.md)

## 验证与排错

验证建议：

1. 先用 short syntax 写最小脚本（例如 `console.log`）确认匹配生效。
2. 再引入 `ctx.headers` 或 `ctx.body` 做单点改写。
3. 最后再叠加 `ctx.flow` 和 `ctx.persist` 做阶段协作。

常见错误：

- `when` 写了 `#hash`，但 `on=request/response`：该规则不会生效。
- 没有 `SAFE_UID` 且 `auth_required=true`：inject 会被跳过。
- `ctx.body.getJSON()` 直接解析失败：请求体并非合法 JSON，需要先判断或捕获异常。

## 下一步

- 需要做免密登录流程，请继续阅读：[免密登录](./advanced-inject-passwordless-login.md)
