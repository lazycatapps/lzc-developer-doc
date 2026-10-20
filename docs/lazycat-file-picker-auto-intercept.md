# 自动拦截文件选择器

## 目标

本文看完后，你能在不修改上游源码的情况下，拦截应用里的原生文件入口，并提供“本地文件系统 / 懒猫微服”两种选择：

1. 打开文件时，用户可以选择从本地打开，或从懒猫微服打开。
2. 保存文件时，用户可以选择保存至本地，或保存至懒猫微服。

## 适合的场景

适合用在这类应用上：

1. 已经支持浏览器原生文件能力，但还没接懒猫网盘。
2. 你不想改上游源码，只想通过注入把文件流转接过来。
3. 应用里存在“打开、保存、上传、下载”这些文件入口。

不适合的场景：

1. 应用根本没有文件打开/保存入口。
2. 你愿意直接改业务前端源码，那可以自己接库，不必走 inject。见 [官方扩展](./extensions.html) 中的`<lzc-file-picker>`。

## 覆盖范围

拦截后直接显示带“网盘文件 / 本地文件”选项的统一窗口。网盘选择器显示在窗口内；选择本地文件时继续应用原有的浏览器流程。

- 打开：`showOpenFilePicker()` 和普通 `<input type="file">`。从网盘打开的文件句柄支持后续写回。
- 保存：`showSaveFilePicker()`，以及带 `download` 属性的 `blob:` / `data:` 链接。网盘选择器使用 `saveAs` 模式，通过 `saveNames` 显示建议文件名，并允许在选择器内修改。
- 保存到网盘时显示上传进度。新建文件收到 WebDAV `412 Precondition Failed` 时，脚本会追加序号后重试；`409 Conflict` 会直接报错，不会被误判为同名文件。
- 选择他人共享目录时，读取和写入请求通过同源文件桥接转发到网盘，并携带选择器返回的 `owner`；能否保存由共享目录的写入权限决定。

当前只处理网盘的 `/files/home` 空间。目录选择、浏览器接管的普通 HTTP 下载，以及应用直接发起的 `fetch` / `PUT` 不经过这些文件入口，需要单独接入。

## 前置条件

1. lzcos 版本支持 `browser`、`request` inject 和 `ctx.proxy`。
2. 已阅读 [脚本注入（injects）](./advanced-injects.md) 和 [manifest inject 规范](./spec/manifest.md#injects)。
3. 已掌握部署参数渲染（见 [manifest.yml渲染](./advanced-manifest-render.md)）。

## 步骤

一个能直接用的 `lzc-manifest.yml` 示例（[excalidraw](https://lazycat.cloud/appstore/detail/cloud.lazycat.app.excalidraw)）：

```yml
application:
  subdomain: excalidraw
  routes:
    - /=file:///lzcapp/pkg/content/dist
  injects:
    - id: lazycat-file-bridge
      on: request
      when:
        - /__lazycat_file_bridge/*
      do:
        - src: |
            const bridgePrefix = "/__lazycat_file_bridge";
            const requestHost = String(ctx.request.host || "")
              .split(":")[0]
              .toLowerCase();
            const firstDot = requestHost.indexOf(".");
            const method = String(ctx.request.method || "").toUpperCase();

            if (
              firstDot <= 0 ||
              !requestHost.endsWith(".heiyu.space") ||
              !["GET", "HEAD", "PUT"].includes(method)
            ) {
              ctx.response.send(
                ["GET", "HEAD", "PUT"].includes(method) ? 400 : 405,
                "Invalid LazyCat file bridge request",
              );
              return;
            }

            const boxDomain = requestHost.slice(firstDot + 1);
            const fileOrigin = "https://file." + boxDomain;
            const targetPath =
              "/files/home" + ctx.request.path.slice(bridgePrefix.length);

            ctx.headers.del("Origin");
            ctx.headers.del("Referer");
            ctx.proxy.to(fileOrigin, {
              path: targetPath,
              query: ctx.request.raw_query,
              use_target_host: true,
              timeout_ms: 120000,
              on_fail: "error",
            });
    - id: open-save-chooser
      on: browser
      when:
        - /*
      do:
        - src: file:///lzcapp/pkg/content/lazycat-injects/lzc-file-chooser-inject.js
  file_handler:
    mime:
      - x-lzc-extension/excalidraw
    actions:
      open: /?fileUrl=/%u
```

下载资源：

- [下载 `lzc-file-chooser-inject.js`](/lazycat-injects/lzc-file-chooser-inject.js)

### 为什么需要同源文件桥接

文件选择器会返回 `webdavUrl` 和可选的 `owner`。`webdavUrl` 位于 `file.<微服域名>.heiyu.space`，应用页面位于自己的子域名，直接从页面向该地址发送带 `Owner` 的 WebDAV 请求会受到浏览器跨域规则限制。

`lazycat-file-bridge` 在应用域名下接收同源请求，再通过 `ctx.proxy` 转发到当前微服的网盘服务：

1. 浏览器登录 Cookie 随同源请求进入桥接。
2. 桥接保留 Cookie、`Owner`、`If-None-Match`、`Content-Type` 和请求正文。
3. 目标域名只能由当前应用域名推导为 `file.<微服域名>.heiyu.space`。
4. 桥接只接受 `GET`、`HEAD` 和 `PUT`。

不要只复制 browser inject。缺少 request inject 时，自己的目录可能仍能通过 `diskRoot` 工作，但他人共享目录无法按 `owner` 切换到正确的文件根目录。

## 验证

1. 打开应用页面，触发一次“打开文件”或“保存文件”。
2. 页面出现统一窗口，顶部可选择“网盘文件 / 本地文件”。
3. 在网盘页选择文件或保存目录，操作完成后窗口关闭；保存时可看到上传进度。
4. 点击“本地文件”，应用原有的浏览器选择流程继续执行。
5. 选择一个他人共享且可写的目录保存文件，确认请求地址以 `/__lazycat_file_bridge/` 开头，并且请求头包含选择器返回的 `Owner`。

## 常见错误

### 保存到他人共享目录返回 `409 Conflict`

先检查请求地址。正确地址应以应用域名下的 `/__lazycat_file_bridge/` 开头。若请求仍发往 `/_lzc/files/home/`，说明只更新了 browser inject，没有配置 `lazycat-file-bridge`，或页面仍在使用旧脚本。

`409` 表示目标路径或父目录存在冲突，不能据此判断文件同名。脚本只把带 `If-None-Match: *` 的 `412` 当作同名冲突。

### 保存返回 `401` 或跳转到登录页

确认应用页面本身已经登录，并且 request inject 没有删除 Cookie。桥接依赖应用请求携带的微服登录 Cookie 完成网盘鉴权。

### 选择器中有文件名，外层窗口又出现文件名输入框

应使用本文提供的最新脚本。文件名由 `<lzc-file-picker type="saveAs">` 的 `saveNames` 和选择结果统一管理，外层窗口不再创建第二个文件名输入框。

## 下一步

- 如果你还想了解 `injects` 的匹配与执行顺序，再看 [脚本注入（injects）](./advanced-injects.md)。

## `lzc-file-chooser-inject.js` 参数说明

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| `diskRoot` | `string` | `/_lzc/files/home` | 懒猫网盘在当前站点下的文件根路径。 |
| `fileBridgeRoot` | `string` | `/__lazycat_file_bridge` | 选择器返回 `/files/home` 地址时使用的同源桥接路径，必须和 request inject 的 `bridgePrefix` 一致。 |
| `fallbackMime` | `string` | `application/octet-stream` | 无法判断文件类型时的兜底 MIME。 |
| `locale` | `string` | `auto` | 文案语言，`auto` 会按浏览器语言自动选择。 |
| `text` | `object` | `{}` | 自定义按钮和标题文案，支持按语言分组。 |
| `hooks.fileSystemAccess` | `bool` | `true` | 是否接管 `showOpenFilePicker()` / `showSaveFilePicker()`。 |
| `hooks.fileInput` | `bool` | `true` | 是否接管 `<input type="file">`。 |
| `hooks.downloadAnchor` | `bool` | `true` | 是否接管带 `download` 属性的 `blob:` / `data:` 链接。 |

### `text` 参数

`text` 用来改选择弹窗里的标题和按钮文案。支持两种写法：

1. 按语言分组：推荐写法，适合 `locale: auto`。
2. 顶层字段覆盖：适合只维护一种语言，或只临时覆盖某个文案。

支持的字段：

| 字段 | 默认中文 | 默认英文 | 显示位置 |
| ---- | ---- | ---- | ---- |
| `openTitle` | `打开` | `Open` | 打开窗口的无障碍标题 |
| `saveTitle` | `保存` | `Save` | 保存窗口的无障碍标题 |
| `cloudTab` | `网盘文件` | `Cloud files` | 顶部网盘选项 |
| `localTab` | `本地文件` | `Local files` | 顶部本地选项 |
| `openLazyCat` | `从懒猫打开` | `Open from LazyCat` | 网盘打开选择器标题 |
| `saveLazyCat` | `保存至懒猫` | `Save to LazyCat` | 网盘保存选择器标题 |
| `transfer` | `正在保存到网盘` | `Saving to cloud` | 上传进度提示 |
| `transferDone` | `已保存到网盘` | `Saved to cloud` | 上传成功提示 |
| `transferFailed` | `保存到网盘失败` | `Failed to save to cloud` | 上传失败提示 |
| `cancel` | `取消` | `Cancel` | 窗口关闭按钮的无障碍标签 |

按语言分组示例：

```yml
params:
  locale: auto
  text:
    zh-CN:
      openTitle: 打开
      saveTitle: 保存
      cloudTab: 网盘文件
      localTab: 本地文件
      openLazyCat: 从懒猫打开
      saveLazyCat: 保存至懒猫
      cancel: 取消
    en-US:
      openTitle: Open
      saveTitle: Save
      cloudTab: Cloud files
      localTab: Local files
      openLazyCat: Open from LazyCat
      saveLazyCat: Save to LazyCat
      cancel: Cancel
```

顶层字段覆盖示例：

```yml
params:
  locale: zh-CN
  text:
    cloudTab: 懒猫微服
    localTab: 本地文件
```

规则：

1. `locale: auto` 时，浏览器语言以 `zh` 开头就使用 `zh-CN`，否则使用 `en-US`。
2. 未配置 `text` 时使用内置默认文案。
3. 只配置部分字段时，未配置的字段继续使用当前语言的默认文案。
4. 同时写了语言分组和顶层字段时，顶层字段优先级更高。

### 参数写法

`params` 应该写在 `do[].params` 里，而不是写成脚本文件名。

```yml
application:
  injects:
    - id: open-save-chooser
      on: browser
      when:
        - /*
      do:
        - src: file:///lzcapp/pkg/content/lazycat-injects/lzc-file-chooser-inject.js
          params:
            diskRoot: /_lzc/files/home
            fileBridgeRoot: /__lazycat_file_bridge
            fallbackMime: application/octet-stream
            locale: auto
            text:
              zh-CN:
                openTitle: 打开
                saveTitle: 保存
                cloudTab: 网盘文件
                localTab: 本地文件
                openLazyCat: 从懒猫打开
                saveLazyCat: 保存至懒猫
                cancel: 取消
              en-US:
                openTitle: Open
                saveTitle: Save
                cloudTab: Cloud files
                localTab: Local files
                openLazyCat: Open from LazyCat
                saveLazyCat: Save to LazyCat
                cancel: Cancel
            hooks:
              fileSystemAccess: true
              fileInput: true
              downloadAnchor: true
```
