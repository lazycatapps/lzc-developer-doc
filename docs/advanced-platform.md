# 平台支持
懒猫微服客户端覆盖 Linux、Windows、macOS、Android、iOS、鸿蒙等平台，各应用实际支持的平台取决于自身的适配情况。如果您的应用不支持某些平台，可以通过 `unsupported_platforms` 字段声明。

LPK v1 将该字段放在 `lzc-manifest.yml` 顶层，与 `application` 同级；LPK v2 将其放在 `package.yml` 顶层，与 `package`、`version` 同级。两个版本的字段含义和写法相同，在对应文件顶层加入以下配置片段：

```yml
unsupported_platforms:
  - ios
```

上面的配置的意思是， 您的应用不支持 iOS 平台， 当用户在 iOS 平台下点击应用图标， 微服系统会弹出 `您的应用不支持当前平台` 的提示。

相关可用参数如下:

| 参数    | 平台                                            |
|---------|-------------------------------------------------|
| ios     | 不支持 iOS 和 iPad 移动端                       |
| android | 不支持 Android 移动端                           |
| linux   | 不支持 Linux 桌面端                             |
| windows | 不支持 Windows 桌面端                           |
| macos   | 不支持 Macos 桌面端                             |
| tvos    | 不支持 懒猫智慧屏 平台端 (要求系统 1.0.18 以上) |
