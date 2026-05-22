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

<!-- ## 效果

注入后，用户看到的是一层统一的选择流程：

1. 打开文件时，可以在“本地 / 懒猫”之间选。
2. 保存文件时，可以直接写回懒猫网盘。
3. 上传文件时，原生文件选择框会被接管。
4. 下载链接是 `blob:` 时，也能走懒猫保存流程。
5. 如果选择器资源没注入成功，脚本会降级回原生行为。
6. 中文页面默认显示中文文案，英文页面默认显示英文文案。 -->

## 前置条件

1. lzcos 版本满足 inject 功能要求。
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

## 验证

1. 打开应用页面，触发一次“打开文件”或“保存文件”。
2. 页面出现“本地文件系统 / 懒猫微服”的选择弹窗。
3. 选择“懒猫微服”，会打开懒猫文件选择器。
4. 选中本地文件系统后，应用原有流程继续执行。

## 下一步

- 如果你还想了解 `injects` 的匹配与执行顺序，再看 [脚本注入（injects）](./advanced-injects.md)。

## `lzc-file-chooser-inject.js` 参数说明

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| `diskRoot` | `string` | `/_lzc/files/home` | 懒猫网盘在当前站点下的文件根路径。 |
| `fallbackMime` | `string` | `application/octet-stream` | 无法判断文件类型时的兜底 MIME。 |
| `locale` | `string` | `auto` | 文案语言，`auto` 会按浏览器语言自动选择。 |
| `text` | `object` | `{}` | 自定义按钮和标题文案，支持按语言分组。 |
| `hooks.fileSystemAccess` | `bool` | `true` | 是否接管 `showOpenFilePicker()` / `showSaveFilePicker()`。 |
| `hooks.fileInput` | `bool` | `true` | 是否接管 `<input type="file">`。 |

### `text` 参数

`text` 用来改选择弹窗里的标题和按钮文案。支持两种写法：

1. 按语言分组：推荐写法，适合 `locale: auto`。
2. 顶层字段覆盖：适合只维护一种语言，或只临时覆盖某个文案。

支持的字段：

| 字段 | 默认中文 | 默认英文 | 显示位置 |
| ---- | ---- | ---- | ---- |
| `openTitle` | `打开` | `Open` | 打开文件弹窗标题 |
| `saveTitle` | `保存` | `Save` | 保存文件弹窗标题 |
| `openLocal` | `从本地打开` | `Open from local device` | 打开文件时的本地选项 |
| `openLazyCat` | `从懒猫打开` | `Open from LazyCat` | 打开文件时的懒猫选项 |
| `saveLocal` | `保存至本地` | `Save to local device` | 保存文件时的本地选项 |
| `saveLazyCat` | `保存至懒猫` | `Save to LazyCat` | 保存文件时的懒猫选项 |
| `cancel` | `取消` | `Cancel` | 弹窗取消按钮 |

按语言分组示例：

```yml
params:
  locale: auto
  text:
    zh-CN:
      openTitle: 打开
      saveTitle: 保存
      openLocal: 从本地打开
      openLazyCat: 从懒猫打开
      saveLocal: 保存至本地
      saveLazyCat: 保存至懒猫
      cancel: 取消
    en-US:
      openTitle: Open
      saveTitle: Save
      openLocal: Open from local device
      openLazyCat: Open from LazyCat
      saveLocal: Save to local device
      saveLazyCat: Save to LazyCat
      cancel: Cancel
```

顶层字段覆盖示例：

```yml
params:
  locale: zh-CN
  text:
    openLazyCat: 从懒猫微服打开
    saveLazyCat: 保存至懒猫微服
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
            fallbackMime: application/octet-stream
            locale: auto
            text:
              zh-CN:
                openTitle: 打开
                saveTitle: 保存
                openLocal: 从本地打开
                openLazyCat: 从懒猫打开
                saveLocal: 保存至本地
                saveLazyCat: 保存至懒猫
                cancel: 取消
              en-US:
                openTitle: Open
                saveTitle: Save
                openLocal: Open from local device
                openLazyCat: Open from LazyCat
                saveLocal: Save to local device
                saveLazyCat: Save to LazyCat
                cancel: Cancel
            hooks:
              fileSystemAccess: true
              fileInput: true
```
