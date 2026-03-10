# File Access
In the previous chapter, we mentioned that applications can achieve data persistence by saving files to the `/lzcapp/var` directory.

If an application needs to access user files, use the stable path `/lzcapp/documents/${username}` in code.

LCMD automatically mounts user documents into the container at:

- `/lzcapp/documents` (stable semantics)

## Mount Point List

| Mount Directory | Description |
| -- | -- |
| /lzcapp/var | Application storage directory. After application uninstallation, it will only be deleted if "Also clean data" is checked.|
| /lzcapp/cache | Application cache directory. This directory is used to store unimportant data or files. LCMD users can manually clean it in application management. It is suitable for storing log files or temporary files that do not need to be persisted|
| /lzcapp/documents | User document root directory. Path semantics are the same for both single-instance and multi-instance apps. Access a specific user with `/lzcapp/documents/<username>`.|
| /lzcapp/pkg | Application static resource directory, containing configuration files and resources carried during application packaging. This directory is read-only.|
| /lzcapp/pkg/content | LPK package content specified by the `contentdir` parameter in `lzc-build.yml`, content built and packaged in the LPK application. This directory is read-only. |

::: warning
1. Currently, the `lzc-manifest.yml` configuration file of lzcapp only supports mounting folders in the mount point list above.
2. Apps use `/lzcapp/documents` to avoid path-adaptation logic when switching between single-instance and multi-instance modes.
3. In multi-instance apps, `/lzcapp/documents` exposes only the current deploy user directory; in single-instance apps, it exposes multiple user directories.
:::

## Common Questions?

Q: When different family members use the same app, which user's document directory is visible under `/lzcapp/documents`?

A: There is a **single-instance** and **multi-instance** app model (see [Multi-Instance](./advanced-multi-instance)). The path semantics stay the same, and only the visible top-level directories differ.

1. For **multi-instance** apps, `/lzcapp/documents` contains only the current instance owner's directory.
2. For **single-instance** apps, `/lzcapp/documents` contains multiple user directories, and the app should decide which user directory to write to.

Q: How to access resources mounted by LCMD Cloud Drive within the app container?

A: Configure [enable_media_access: true](https://developer.lazycat.cloud/spec/manifest.html#ext_config) in `lzc-manifest.yml`, then mounted resources are available under `/lzcapp/media/RemoteFS` in the container.
