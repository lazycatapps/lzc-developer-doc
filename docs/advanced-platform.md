# 平台支持
微服官方应用天然支持 Linux/Windows/macOS/Android/iOS/鸿蒙等 6 个平台， 当您开发的应用并不想支持某些平台时， 可以在 `lzc-manifest.yml` 文件中加入 `unsupported_platforms` 字段即可：

```yml
unsupported_platforms:
  - ios
```

上面的配置的意思是， 您的应用不支持 iOS 平台， 当用户在 iOS 平台下点击应用图标， 微服系统会弹出 `您的应用不支持当前平台` 的提示。