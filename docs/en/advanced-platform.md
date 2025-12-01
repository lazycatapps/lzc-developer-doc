# Platform Support
LCMD official applications natively support 6 platforms: Linux/Windows/macOS/Android/iOS/HarmonyOS. When your developed application does not want to support certain platforms, you can add the `unsupported_platforms` field in the `lzc-manifest.yml` file:

```yml
unsupported_platforms:
  - ios
```

The above configuration means that your application does not support the iOS platform. When users click the application icon on the iOS platform, the LCMD system will pop up a prompt saying `Your application does not support the current platform`.

Related available parameters are as follows:

| Parameter | Platform                                            |
|---------|-------------------------------------------------|
| ios     | Does not support iOS and iPad mobile devices                       |
| android | Does not support Android mobile devices                           |
| linux   | Does not support Linux desktop                             |
| windows | Does not support Windows desktop                           |
| macos   | Does not support macOS desktop                             |
| tvos    | Does not support LCMD Smart Screen platform (requires system 1.0.18 or above) |
