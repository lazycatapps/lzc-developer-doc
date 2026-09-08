# Platform Support
Lazycat Microserver clients are available on platforms including Linux, Windows, macOS, Android, iOS, and HarmonyOS. Platform support varies by application and depends on its compatibility with each platform. If your application does not support certain platforms, declare them using the `unsupported_platforms` field.

In LPK v1, place this field at the top level of `lzc-manifest.yml`, alongside `application`; in LPK v2, place it at the top level of `package.yml`, alongside `package` and `version`. The field has the same meaning and syntax in both versions. Add the following configuration snippet at the top level of the corresponding file:

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
