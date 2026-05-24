# Application Client Capability Integration Guide

## 1. Before You Start

### 1.1 Recommended environment check

Check whether the current page is running inside the client WebShell before calling host capabilities.

```js
import base from "@lazycatcloud/sdk/dist/extentions/base"

export const isIosWebShell = () => base.isIosWebShell()
export const isAndroidWebShell = () => base.isAndroidWebShell()
export const isClientWebShell = () => isIosWebShell() || isAndroidWebShell()
```

### 1.2 Recommended calling principles

- Prefer SDK wrappers when a capability has one
- Call host-injected objects directly only when there is no SDK wrapper
- Always check whether a host capability exists before calling it

```js
export function safeCall(fn, fallback) {
  try {
    return fn ? fn() : fallback
  } catch (error) {
    console.warn("[client-api] call failed", error)
    return fallback
  }
}
```

## 2. Capability Matrix

| Capability | Supported platforms | Recommended entry |
| --- | --- | --- |
| System notifications | Android / iOS / macOS / Windows / Linux | `currentDevice.notification.Notify` / `getDeviceProxy(...).notification.Notify` |
| Launch a lightweight app | iOS / Android | `AppCommon.LaunchApp` |
| Disable dark mode for a page | iOS / Android | `meta[name="lzcapp-disable-dark"]` |
| Lightweight app fullscreen control | iOS / Android | `AppCommon.SetFullScreen` / `CancelFullScreen` / `GetFullScreenStatus` |
| File sharing | iOS / Android | `AppCommon.ShareWithFiles` |
| Media sharing | iOS / Android | `AppCommon.ShareMedia` |
| Open with another app | iOS / Android | `AppCommon.OpenWith` |
| Open lightweight app in a temporary window | iOS | `AppCommon.OpenAppTemporaryWindow` |
| Close button visibility control | iOS | `window.webkit.messageHandlers.SetCloseBtnShowStatus` |
| Close button layout CSS variables | iOS | Host-injected CSS variables |
| Navigation bar / status bar meta tags | iOS | `lzcapp-navigation-bar-scheme` and related meta tags |
| Open client theme mode page | iOS | `client_OPENThemeMode` |
| Generic system share | iOS | `SystemShare` |
| Volume / brightness control | iOS | `AppCommon.GetDeviceVolume` and related APIs |
| Lock screen music control | Android | `MediaSession.*` |
| Native image sharing | Android | `AppCommon.ShareImage` |
| Status bar color | Android | `lzc_window.SetStatusBarColor` |
| Control bar visibility | Android | `lzc_tab.SetControlViewVisibility` |
| Read control bar state | Android | `lzc_tab.GetControlViewVisibility` |
| Resize WebView with keyboard | Android | `lzc_window.EnableWebviewResize` |
| Client theme mode | Android | `lzc_theme.getThemeMode` / `setThemeMode` |

## 3. All Platforms / iOS / Android

### 3.1 System notifications

Recommended entries:

- Current client in JS: `currentDevice.notification.Notify(request)`
- Specific client in JS: `getDeviceProxy(uniqueDeivceId).notification.Notify(request)`

Supported platforms:

- Android
- iOS
- macOS
- Windows
- Linux

Request fields:

- `title`: notification title
- `body`: notification body
- `deeplinkUrl`: optional deeplink URL opened when the user clicks the notification; leave it empty to only display the notification without a click target

Notes:

- This API abstracts only the minimum common notification semantics across platforms
- Notification permissions, visual style, grouping, and display policy are implemented by each client platform
- To notify a device other than the current client, call `ListEndDevices` first, then create a client API connection to the target device

Notify the current client:

```js
import { lzcAPIGateway } from "@lazycatcloud/sdk"

const lzcapi = new lzcAPIGateway(window.location.origin, false)

export async function notifyCurrentDevice() {
  const device = await lzcapi.currentDevice

  await device.notification.Notify({
    title: "Task completed",
    body: "The import task has finished",
    deeplinkUrl: "lzc://app/cloud.lazycat.app.demo",
  })
}
```

List devices and notify a specific device:

```js
import { lzcAPIGateway } from "@lazycatcloud/sdk"

const lzcapi = new lzcAPIGateway(window.location.origin, false)

export async function listCurrentUserDevices() {
  const session = await lzcapi.session
  const reply = await lzcapi.devices.ListEndDevices({ uid: session.uid })
  return reply.devices
}

export async function notifyDevice(uniqueDeviceId) {
  const devices = await listCurrentUserDevices()
  const target = devices.find((device) => {
    return device.isOnline && device.uniqueDeivceId === uniqueDeviceId
  })

  if (!target) {
    throw new Error(`device not found or offline: ${uniqueDeviceId}`)
  }

  const device = await lzcapi.getDeviceProxy(target.uniqueDeivceId)

  await device.notification.Notify({
    title: "New message",
    body: "You have a new message from the lightweight app",
  })
}
```

### 3.2 Launch a lightweight app

Recommended entry:

- `AppCommon.LaunchApp(url, appid, options?)`

Recommended scenarios:

- Navigate from one page to another lightweight app
- Open a file handling app
- Open an app page in the app store

Example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

export async function openPhotoApp(boxDomain: string) {
  const url = `https://photo.${boxDomain}`
  await AppCommon.LaunchApp(url, "cloud.lazycat.app.photo", {
    forcedRefresh: true,
  })
}
```

Notes:

- `forcedRefresh: true` is useful when the host should force refresh the target app page
- When the page is not running in the client environment, the SDK falls back to browser behavior

### 3.3 Disable dark mode for a page

Supported platforms:

- iOS
- Android

Integration:

Declare this in the page `<head>`:

```html
<meta name="lzcapp-disable-dark" content="true">
```

Recommended truthy values:

- `true`
- `1`
- `yes`
- `on`

Complete example:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="lzcapp-disable-dark" content="true" />
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

Notes:

- Use this meta tag when your page already has a complete light theme design
- Declare it in the initial HTML whenever possible
- iOS currently supports applying runtime updates to this meta tag; Android is documented as supported

### 3.4 Lightweight app fullscreen control

Recommended entries:

- `AppCommon.SetFullScreen()`
- `AppCommon.CancelFullScreen()`
- `AppCommon.GetFullScreenStatus()`

Example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

export async function enterFullScreen() {
  await AppCommon.SetFullScreen()
}

export async function exitFullScreen() {
  await AppCommon.CancelFullScreen()
}

export async function toggleFullScreen() {
  const isFull = await AppCommon.GetFullScreenStatus()
  if (isFull) {
    await AppCommon.CancelFullScreen()
  } else {
    await AppCommon.SetFullScreen()
  }
}
```

Browser event example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

let isFull = false

document.getElementById("fullscreen-btn").addEventListener("click", async function () {
  if (isFull) {
    await AppCommon.CancelFullScreen()
    isFull = false
    this.textContent = "Enter fullscreen"
  } else {
    await AppCommon.SetFullScreen()
    isFull = true
    this.textContent = "Exit fullscreen"
  }
})

AppCommon.GetFullScreenStatus().then(function (value) {
  isFull = !!value
  document.getElementById("fullscreen-btn").textContent = isFull ? "Exit fullscreen" : "Enter fullscreen"
})
```

Notes:

- This controls fullscreen at the host container level, not DOM `requestFullscreen()`
- It is better suited for making the whole lightweight app page fullscreen

### 3.5 File sharing

Recommended entry:

- `AppCommon.ShareWithFiles(path?, paths?, mediaIds?)`

Supported platforms:

- iOS
- Android

Use cases:

- Share one offline file
- Share multiple offline files
- Share media assets
- Share files and media assets together

Single file example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

await AppCommon.ShareWithFiles("/private/path/to/report.pdf")
```

Multiple files example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

await AppCommon.ShareWithFiles(
  undefined,
  [
    "/private/path/to/a.pdf",
    "/private/path/to/b.docx",
  ]
)
```

Mixed sharing example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

await AppCommon.ShareWithFiles(
  undefined,
  ["/private/path/to/a.pdf"],
  ["media-id-1", "media-id-2"]
)
```

Real project reference:

- `lzc-files/ui/src/mobile/store/sharewith.ts`

Notes:

- `path`, `paths`, and `mediaIds` cannot all be empty
- Prefer this API on mobile instead of the legacy `ShareWith`

### 3.6 Media sharing

Recommended entry:

- `AppCommon.ShareMedia({ actionName?, ids?, id? })`

Supported platforms:

- iOS
- Android

Platform differences:

- iOS
  - Only `id` or `ids` is required
- Android
  - `actionName` is required
  - `actionName` consists of the package name and class name

iOS example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

await AppCommon.ShareMedia({
  ids: ["media-id-1", "media-id-2"],
})
```

Android example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

await AppCommon.ShareMedia({
  actionName: "com.example.app:com.example.app.ShareActivity",
  ids: ["media-id-1"],
})
```

### 3.7 Open with another app

Recommended entry:

- `AppCommon.OpenWith(boxName, path, appid)`

Supported platforms:

- iOS
- Android

Notes:

- This capability means opening a file with another app
- It is often used together with sharing, but its semantics are closer to the system "open with" action

Example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

await AppCommon.OpenWith("", "/private/path/to/demo.pdf", "")
```

## 4. iOS Only

### 4.1 Open a lightweight app in a temporary window

Recommended entry:

- `AppCommon.OpenAppTemporaryWindow(url)`

Use cases:

- Open an app store detail page
- Open an upgrade page, explanation page, or external jump page
- Open a page as a temporary window instead of a regular lightweight app stack

Example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"
import base from "@lazycatcloud/sdk/dist/extentions/base"

export async function openAppStoreDetail(pkgId) {
  const domain = window.location.host.split(".").slice(1).join(".")
  const targetUrl = `https://appstore.${domain}/?#/shop/detail/${pkgId}`

  if (base.isIosWebShell()) {
    await AppCommon.OpenAppTemporaryWindow(targetUrl)
  } else {
    window.location.href = targetUrl
  }
}
```

### 4.2 Close button visibility control

There is currently no unified SDK wrapper. Call the iOS JSBridge directly.

Integration:

```js
function setIosCloseButtonVisible(visible) {
  const bridge = window?.webkit?.messageHandlers?.["SetCloseBtnShowStatus"]
  if (!bridge?.postMessage) return

  bridge.postMessage({
    params: [visible],
  })
}
```

Page event example:

```js
function setIosCloseButtonVisible(visible) {
  const bridge = window?.webkit?.messageHandlers?.["SetCloseBtnShowStatus"]
  if (!bridge?.postMessage) return

  bridge.postMessage({
    params: [visible],
  })
}

document.getElementById("open-preview").addEventListener("click", function () {
  setIosCloseButtonVisible(false)
})

document.getElementById("close-preview").addEventListener("click", function () {
  setIosCloseButtonVisible(true)
})
```

Notes:

- This capability affects the host-level close button
- If your page also needs to reserve space for the close button, use the CSS variables in the next section

### 4.3 Close button layout CSS variables

The host injects these CSS variables:

- `--lzc-client-safearea-view-width`
- `--lzc-client-safearea-view-height`
- `--lzc-client-safearea-view-top`
- `--lzc-client-safearea-view-right`

Recommended uses:

- Reserve space for a title or action area in the top-right corner
- Add safe-area padding to a sticky header

Example:

```css
.page-header {
  padding-top: calc(var(--lzc-client-safearea-view-top, 0px) + 8px);
  padding-right: calc(var(--lzc-client-safearea-view-right, 0px) + var(--lzc-client-safearea-view-width, 0px) + 12px);
}

.floating-toolbar {
  top: calc(var(--lzc-client-safearea-view-top, 0px));
  right: calc(var(--lzc-client-safearea-view-right, 0px));
}
```

### 4.4 Navigation bar / status bar meta tags

#### 4.4.1 Navigation bar style

Supported meta:

```html
<meta name="lzcapp-navigation-bar-scheme" content="sink" />
```

Available values:

- `default`
- `sink`
- `hidden`
- `statusBarOnly`

Meaning:

- `default`
  - Show the top navigation area
  - Show the close button
- `sink`
  - Hide the top navigation area
  - Show the close button
- `hidden`
  - Hide the top navigation area
  - Hide the close button
- `statusBarOnly`
  - Hide the top navigation area
  - Show the close button
  - Keep only the status bar area

Example:

```html
<meta name="lzcapp-navigation-bar-scheme" content="statusBarOnly" />
```

#### 4.4.2 Status bar style

Configurable meta tags:

```html
<meta name="lzcapp-state-bar-scheme" content="hidden" />
<meta name="lzcapp-state-bar-color" content="#F7F8FA" />
<meta name="lzcapp-state-bar-color-dark" content="#111111" />
```

Example 1: immersive page

```html
<meta name="lzcapp-navigation-bar-scheme" content="sink" />
<meta name="lzcapp-state-bar-scheme" content="sink" />
```

Example 2: keep a status bar color

```html
<meta name="lzcapp-navigation-bar-scheme" content="statusBarOnly" />
<meta name="lzcapp-state-bar-color" content="#FFFFFF" />
<meta name="lzcapp-state-bar-color-dark" content="#111111" />
```

Notes:

- Put these meta tags in the initial page HTML whenever possible
- iOS currently supports host refresh when these meta tags are changed at runtime

### 4.5 Generic system share

Recommended entry:

- `SystemShare(contentOrPath)`

Supported platform:

- iOS

Use cases:

- Share text
- Share a local file path
- Share a `file://` file URL

Share text example:

```js
const sdk = window.lzcSDK || window.sdk

if (sdk && typeof sdk.call === "function") {
  sdk.call("SystemShare", "https://lazycat.cloud")
}
```

Share file example:

```js
const sdk = window.lzcSDK || window.sdk

if (sdk && typeof sdk.call === "function") {
  sdk.call("SystemShare", "/private/path/to/report.pdf")
}
```

Notes:

- This is the currently implemented native system share sheet capability on iOS
- A local path triggers file sharing
- A regular string triggers text sharing

### 4.6 Volume / brightness control

Recommended entries:

- `AppCommon.GetDeviceVolume()`
- `AppCommon.SetDeviceVolume(value)`
- `AppCommon.GetScreenBrightness()`
- `AppCommon.SetScreenBrightness(value)`

Example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

export async function setHalfBrightness() {
  await AppCommon.SetScreenBrightness(0.5)
}

export async function setHalfVolume() {
  await AppCommon.SetDeviceVolume(0.5)
}

export async function readDeviceState() {
  const [volume, brightness] = await Promise.all([
    AppCommon.GetDeviceVolume(),
    AppCommon.GetScreenBrightness(),
  ])

  return { volume, brightness }
}
```

### 4.7 Listen to volume keys

Recommended entry:

- `AppCommon.OnVolumeKeyEvent(callback)`

Example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

const dispose = AppCommon.OnVolumeKeyEvent((event) => {
  console.log("volume key event", event)
})

// Cancel the listener when the page unloads
// dispose()
```

Note:

- The native iOS and SDK event chain should still be verified on a real device

## 5. Android Only

### 5.1 Lock screen music control (MediaSession)

Recommended entries:

- `MediaSession`
- `isMediaSessionAvailable()`

Import:

```js
import {
  MediaSession,
  isMediaSessionAvailable,
} from "@lazycatcloud/sdk/dist/extentions/mediasession/index"
```

Basic example:

```js
export async function setupPlayerMediaSession(audio, title) {
  if (!isMediaSessionAvailable()) return

  await MediaSession.setMetadata({
    title,
  })

  await MediaSession.setPlaybackState({
    playbackState: audio.paused ? "paused" : "playing",
  })

  await MediaSession.setPositionState({
    position: audio.currentTime,
    duration: audio.duration,
    playbackRate: audio.playbackRate,
  })

  await MediaSession.setActionHandler({ action: "play" }, () => audio.play())
  await MediaSession.setActionHandler({ action: "pause" }, () => audio.pause())
  await MediaSession.setActionHandler({ action: "nexttrack" }, () => {
    console.log("play next")
  })
  await MediaSession.setActionHandler({ action: "previoustrack" }, () => {
    console.log("play previous")
  })
}
```

Page integration example:

```js
import {
  MediaSession,
  isMediaSessionAvailable,
} from "@lazycatcloud/sdk/dist/extentions/mediasession/index"

const audio = document.getElementById("audio")

async function bindMediaSession() {
  if (!isMediaSessionAvailable()) return

  await MediaSession.setMetadata({ title: "Example audio" })

  await MediaSession.setActionHandler({ action: "play" }, function () {
    audio.play()
  })

  await MediaSession.setActionHandler({ action: "pause" }, function () {
    audio.pause()
  })

  audio.addEventListener("play", function () {
    MediaSession.setPlaybackState({ playbackState: "playing" })
  })

  audio.addEventListener("pause", function () {
    MediaSession.setPlaybackState({ playbackState: "paused" })
  })
}

bindMediaSession()
```

This example uses:

- `setMetadata`
- `setPlaybackState`
- `setPositionState`
- `setActionHandler(nexttrack / previoustrack / play / pause / seekto / stop / seekforward / seekbackward)`

### 5.2 Native image sharing

Recommended entry:

- `AppCommon.ShareImage(data)`

Supported platform:

- Android

Use cases:

- Share images from an Android WebView where `navigator.share` cannot directly share images
- Share image binary data that you already have

Example:

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

async function shareCanvasImage(canvas) {
  const blob = await new Promise(function (resolve) {
    canvas.toBlob(resolve, "image/png")
  })

  const arrayBuffer = await blob.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)

  await AppCommon.ShareImage(data)
}
```

### 5.3 Status bar color

Android clients usually inject the `lzc_window` namespace.

Recommended wrapper:

```js
export function setAndroidStatusBarColor(color) {
  const api = window.lzc_window
  if (!api?.SetStatusBarColor) return
  api.SetStatusBarColor(color)
}
```

Usage example:

```js
setAndroidStatusBarColor("#FFFFFF")
setAndroidStatusBarColor("#D6E7EE")
```

Notes:

- The color must be a string starting with `#`
- Call this only in the Android client environment

### 5.4 Control bar visibility

Recommended wrapper:

```js
export async function setAndroidControlViewVisible(visible) {
  const api = window.lzc_tab
  if (!api?.SetControlViewVisibility) return
  api.SetControlViewVisibility(visible)
}

export async function getAndroidControlViewVisible() {
  const api = window.lzc_tab
  if (!api?.GetControlViewVisibility) return true
  return api.GetControlViewVisibility()
}
```

Usage example:

```js
await setAndroidControlViewVisible(false)

const oldVisible = await getAndroidControlViewVisible()
console.log("control view visible:", oldVisible)
```

### 5.5 Resize WebView with keyboard

Recommended wrapper:

```js
export function enableAndroidWebviewResize(enable) {
  const api = window.lzc_window
  if (!api?.EnableWebviewResize) return
  api.EnableWebviewResize(enable)
}
```

Usage example:

```js
enableAndroidWebviewResize(true)
```

Use cases:

- Shrink the page layout when an input is focused and the keyboard opens
- Chat pages, forms, and editors

### 5.6 Client theme mode

Recommended wrapper:

```js
const ThemeMode = {
  DAY_MODE: 0,
  NIGHT_MODE: 1,
  FOLLOW_SYSTEM: 2,
}

export function getAndroidThemeMode() {
  return window.lzc_theme?.getThemeMode?.()
}

export function getAndroidThemeApplyMode() {
  return window.lzc_theme?.GetThemeApplyMode?.()
}

export function setAndroidThemeMode(mode, themeApplyMode) {
  window.lzc_theme?.setThemeMode?.(mode, themeApplyMode)
}
```

Usage example:

```js
const mode = getAndroidThemeMode()
const applyMode = getAndroidThemeApplyMode()

console.log({ mode, applyMode })

setAndroidThemeMode(ThemeMode.FOLLOW_SYSTEM, applyMode ?? 0)
```

## 6. Recommended Integration Order

For a new page, use this order:

1. Add platform detection first
2. Add `lzcapp-disable-dark`
3. If the page needs sharing, integrate `ShareWithFiles` first
4. For an iOS lightweight app, add navigation bar / status bar meta tags
5. If the page needs immersive display, add fullscreen control
6. For a player page, add Android `MediaSession`
7. For a page inside the Android host, add status bar color, control bar visibility, and theme mode as needed

## 7. Common Combinations

### 7.1 Immersive detail page

Applicable platforms:

- iOS / Android

Recommended combination:

- Both platforms:
  - `lzcapp-disable-dark`
  - `AppCommon.SetFullScreen`
- iOS:
  - `lzcapp-navigation-bar-scheme=sink`
  - `lzcapp-state-bar-scheme=sink`

Example:

```html
<meta name="lzcapp-disable-dark" content="true" />
<meta name="lzcapp-navigation-bar-scheme" content="sink" />
<meta name="lzcapp-state-bar-scheme" content="sink" />
```

```js
import { AppCommon } from "@lazycatcloud/sdk/dist/extentions"

await AppCommon.SetFullScreen()
```

### 7.2 iOS file selection / image preview page

Recommended combination:

- iOS close button visibility
- iOS close button layout CSS variables

Example:

```js
function onPreviewOpen() {
  const bridge = window?.webkit?.messageHandlers?.["SetCloseBtnShowStatus"]
  bridge?.postMessage?.({ params: [false] })
}

function onPreviewClose() {
  const bridge = window?.webkit?.messageHandlers?.["SetCloseBtnShowStatus"]
  bridge?.postMessage?.({ params: [true] })
}
```

```css
.preview-toolbar {
  padding-right: calc(
    var(--lzc-client-safearea-view-right, 0px) +
    var(--lzc-client-safearea-view-width, 0px) +
    12px
  );
}
```

### 7.3 Android audio playback page

Recommended combination:

- `MediaSession.setMetadata`
- `MediaSession.setPlaybackState`
- `MediaSession.setPositionState`
- `MediaSession.setActionHandler`

Example:

```js
import {
  MediaSession,
  isMediaSessionAvailable,
} from "@lazycatcloud/sdk/dist/extentions/mediasession/index"

export async function bindAudioSession(audio, title) {
  if (!isMediaSessionAvailable()) return

  await MediaSession.setMetadata({ title })
  await MediaSession.setActionHandler({ action: "play" }, () => audio.play())
  await MediaSession.setActionHandler({ action: "pause" }, () => audio.pause())

  audio.addEventListener("play", () => {
    MediaSession.setPlaybackState({ playbackState: "playing" })
  })

  audio.addEventListener("pause", () => {
    MediaSession.setPlaybackState({ playbackState: "paused" })
  })
}
```

## 8. Compatibility Recommendations

- Check whether every host capability exists before calling it
- Put meta-based capabilities in the initial page HTML whenever possible
- Wrap Android `lzc_window` / `lzc_tab` / `lzc_theme` calls in project-level utilities
- Wrap direct iOS `window.webkit.messageHandlers` calls in a shared hook or utility
- Always provide fallback behavior when the page also needs to support regular browsers
