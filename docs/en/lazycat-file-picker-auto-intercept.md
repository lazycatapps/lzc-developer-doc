# Auto Intercept With FilePicker

## Goal

After reading this page, you can intercept the app's native file entry without modifying upstream source code, and provide two choices: "local file system / LCMD":

1. When opening a file, the user can choose either local device or LCMD.
2. When saving a file, the user can choose either local device or LCMD.

## Suitable Scenarios

Use this pattern for apps that:

1. Already support the browser's native file capabilities, but have not connected LCMD Cloud Drive yet.
2. You do not want to modify upstream source code and only want to bridge the file flow through injects.
3. The app has file entry points such as open, save, upload, or download.

Not suitable for:

1. Apps that do not have any file open/save entry.
2. Cases where you are willing to change the business frontend source directly. In that case, you can integrate the library yourself instead of using injects. See `<lzc-file-picker>` in [Official Extensions](./extensions.html).

<!-- ## Result

After injection, users will see one unified selection flow:

1. When opening a file, users can choose between "local device / LazyCat".
2. When saving a file, users can write directly back to LCMD Cloud Drive.
3. When uploading files, the native file picker will be intercepted.
4. When a download link is `blob:`, the LazyCat save flow can also be used.
5. If the picker resource fails to inject, the script falls back to native behavior.
6. Chinese pages show Chinese text by default, and English pages show English text by default. -->

## Prerequisites

1. The lzcos version meets the inject feature requirements.
2. You have read [Script Injection (injects)](./advanced-injects.md) and [manifest inject spec](./spec/manifest.md#injects).
3. You understand deploy-param rendering (see [manifest.yml Rendering](./advanced-manifest-render.md)).

## Steps

A ready-to-use `lzc-manifest.yml` example ([excalidraw](https://lazycat.cloud/appstore/detail/cloud.lazycat.app.excalidraw)):

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

Download the resource:

- [Download `lzc-file-chooser-inject.js`](/lazycat-injects/lzc-file-chooser-inject.js)

## Validation

1. Open the app page and trigger either "open file" or "save file" once.
2. A "local file system / LCMD" chooser dialog appears.
3. Select "LCMD" and lzc-file-picker opens.
4. Select the local file system and the app continues its original flow.

## Next Step

- If you want to learn about `injects` matching and execution order, continue with [Script Injection (injects)](./advanced-injects.md).

## `lzc-file-chooser-inject.js` Parameter Reference

| Parameter | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `diskRoot` | `string` | `/_lzc/files/home` | The file root path of LCMD Cloud Drive under the current site. |
| `fallbackMime` | `string` | `application/octet-stream` | Fallback MIME type when the file type cannot be determined. |
| `locale` | `string` | `auto` | Text locale. `auto` selects automatically based on browser language. |
| `text` | `object` | `{}` | Custom button and title text, grouped by language if needed. |
| `hooks.fileSystemAccess` | `bool` | `true` | Whether to intercept `showOpenFilePicker()` / `showSaveFilePicker()`. |
| `hooks.fileInput` | `bool` | `true` | Whether to intercept `<input type="file">`. |

### `text` Parameter

`text` is used to change titles and button labels in the chooser dialog. Two forms are supported:

1. Grouped by language: recommended for `locale: auto`.
2. Top-level field override: useful when you only maintain one language, or only want to override a few labels temporarily.

Supported fields:

| Field | Default Chinese | Default English | Location |
| ---- | ---- | ---- | ---- |
| `openTitle` | `打开` | `Open` | Open dialog title |
| `saveTitle` | `保存` | `Save` | Save dialog title |
| `openLocal` | `从本地打开` | `Open from local device` | Local option when opening files |
| `openLazyCat` | `从懒猫打开` | `Open from LazyCat` | LazyCat option when opening files |
| `saveLocal` | `保存至本地` | `Save to local device` | Local option when saving files |
| `saveLazyCat` | `保存至懒猫` | `Save to LazyCat` | LazyCat option when saving files |
| `cancel` | `取消` | `Cancel` | Dialog cancel button |

Language-group example:

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

Top-level override example:

```yml
params:
  locale: zh-CN
  text:
    openLazyCat: 从懒猫微服打开
    saveLazyCat: 保存至懒猫微服
```

Rules:

1. When `locale: auto`, browser languages starting with `zh` use `zh-CN`; otherwise use `en-US`.
2. If `text` is not configured, the built-in default text is used.
3. If only some fields are configured, the remaining fields keep the default text for the current language.
4. If both language groups and top-level fields are set, top-level fields win.

### Parameter Shape

`params` should be written under `do[].params`, not as the script file name.

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
