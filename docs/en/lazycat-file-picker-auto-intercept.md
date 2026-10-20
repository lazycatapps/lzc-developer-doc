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

## Coverage

Interception opens one window with "Cloud files / Local files" tabs. The cloud picker appears inside that window. Choosing local files continues the app's original browser flow.

- Open: `showOpenFilePicker()` and ordinary `<input type="file">` controls. A file opened from the cloud keeps a handle that can write back to it.
- Save: `showSaveFilePicker()` and `blob:` / `data:` links with a `download` attribute. The cloud picker uses `saveAs` with `saveNames` to show and edit the suggested filename inside the picker.
- Cloud saves display upload progress. When a new file receives WebDAV `412 Precondition Failed`, the script retries with a numbered name. It reports `409 Conflict` as an error instead of treating it as a duplicate filename.
- For folders shared by another user, reads and writes go through the same-origin file bridge and carry the picker's `owner` value. Saving still requires write permission on the shared folder.

Only the `/files/home` cloud space is supported. Directory selection, ordinary HTTP downloads handled by the browser, and app initiated `fetch` / `PUT` calls do not use these file entry points and need separate integration.

## Prerequisites

1. The lzcos version supports `browser` and `request` injects and `ctx.proxy`.
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

Download the resource:

- [Download `lzc-file-chooser-inject.js`](/lazycat-injects/lzc-file-chooser-inject.js)

### Why the Same-Origin File Bridge Is Required

The file picker returns a `webdavUrl` and an optional `owner`. The `webdavUrl` belongs to `file.<microserver-domain>.heiyu.space`, while the app page uses its own subdomain. A page request that sends the `Owner` header directly to that WebDAV URL is subject to browser cross-origin rules.

`lazycat-file-bridge` accepts a same-origin request under the app domain and forwards it to the current microserver's file service through `ctx.proxy`:

1. The browser login cookie reaches the bridge with the same-origin request.
2. The bridge preserves Cookie, `Owner`, `If-None-Match`, `Content-Type`, and the request body.
3. The target host can only be derived as `file.<microserver-domain>.heiyu.space` from the current app host.
4. The bridge only accepts `GET`, `HEAD`, and `PUT`.

Do not copy only the browser inject. Without the request inject, the user's own directory might still work through `diskRoot`, but a directory shared by another user cannot switch to the correct file root using `owner`.

## Validation

1. Open the app page and trigger either "open file" or "save file" once.
2. One window appears with "Cloud files / Local files" tabs.
3. Select a cloud file or save destination in the window. Upload progress appears when saving.
4. Select "Local files" to continue the app's original browser flow.
5. Save to a writable directory shared by another user. Confirm that the request URL starts with `/__lazycat_file_bridge/` and that its headers contain the `Owner` returned by the picker.

## Common Errors

### Saving to a shared directory returns `409 Conflict`

Check the request URL first. It should start with `/__lazycat_file_bridge/` under the app domain. If it still targets `/_lzc/files/home/`, only the browser inject was updated, the `lazycat-file-bridge` request inject is missing, or the page still uses an older script.

`409` means the target path or its parent conflicts with the operation. It does not prove that the filename already exists. The script only treats `412` with `If-None-Match: *` as a duplicate-name conflict.

### Saving returns `401` or redirects to the login page

Confirm that the app page itself is logged in and that the request inject does not remove Cookie. The bridge uses the microserver login cookie from the app request to authenticate with Cloud Drive.

### The picker has a filename field and the outer window shows another one

Use the latest script provided on this page. `<lzc-file-picker type="saveAs">` owns the filename through `saveNames` and its selection result. The outer window no longer creates a second filename input.

## Next Step

- If you want to learn about `injects` matching and execution order, continue with [Script Injection (injects)](./advanced-injects.md).

## `lzc-file-chooser-inject.js` Parameter Reference

| Parameter | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| `diskRoot` | `string` | `/_lzc/files/home` | The file root path of LCMD Cloud Drive under the current site. |
| `fileBridgeRoot` | `string` | `/__lazycat_file_bridge` | Same-origin bridge path used for picker `/files/home` URLs. It must match `bridgePrefix` in the request inject. |
| `fallbackMime` | `string` | `application/octet-stream` | Fallback MIME type when the file type cannot be determined. |
| `locale` | `string` | `auto` | Text locale. `auto` selects automatically based on browser language. |
| `text` | `object` | `{}` | Custom button and title text, grouped by language if needed. |
| `hooks.fileSystemAccess` | `bool` | `true` | Whether to intercept `showOpenFilePicker()` / `showSaveFilePicker()`. |
| `hooks.fileInput` | `bool` | `true` | Whether to intercept `<input type="file">`. |
| `hooks.downloadAnchor` | `bool` | `true` | Whether to intercept `blob:` / `data:` links with a `download` attribute. |

### `text` Parameter

`text` is used to change titles and button labels in the chooser dialog. Two forms are supported:

1. Grouped by language: recommended for `locale: auto`.
2. Top-level field override: useful when you only maintain one language, or only want to override a few labels temporarily.

Supported fields:

| Field | Default Chinese | Default English | Location |
| ---- | ---- | ---- | ---- |
| `openTitle` | `打开` | `Open` | Accessible title for the open window |
| `saveTitle` | `保存` | `Save` | Accessible title for the save window |
| `cloudTab` | `网盘文件` | `Cloud files` | Cloud tab |
| `localTab` | `本地文件` | `Local files` | Local tab |
| `openLazyCat` | `从懒猫打开` | `Open from LazyCat` | Cloud open picker title |
| `saveLazyCat` | `保存至懒猫` | `Save to LazyCat` | Cloud save picker title |
| `transfer` | `正在保存到网盘` | `Saving to cloud` | Upload progress notice |
| `transferDone` | `已保存到网盘` | `Saved to cloud` | Upload success notice |
| `transferFailed` | `保存到网盘失败` | `Failed to save to cloud` | Upload failure notice |
| `cancel` | `取消` | `Cancel` | Accessible label for the close button |

Language-group example:

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

Top-level override example:

```yml
params:
  locale: zh-CN
  text:
    cloudTab: 懒猫微服
    localTab: 本地文件
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
