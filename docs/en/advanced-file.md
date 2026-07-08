# File Access
In the previous chapter, we mentioned that applications can achieve data persistence by saving files to the `/lzcapp/var` directory.

If an application needs to store application document files and declares the `document.private` permission id in `package.yml.permissions`, use the stable path `/lzcapp/documents/${uid}` in code. This permission only makes the current application's own application document directory available. It does not grant access to other applications' application document directories.

If an application still needs to access the existing user document directory, use the deprecated compatibility path `/lzcapp/run/mnt/home`. Starting from `v1.7.0`, applications can access this path only after an administrator explicitly grants permission.

LCMD mounts related directories into the application container based on compatibility switches and permission declarations:

- `/lzcapp/run/mnt/home`
- `/lzcapp/documents`

## Choosing Application Documents or Application Data

Application documents and application data are two separate features. Do not use application documents as the application's own persistence directory.

| Type | Directory | Lifecycle Owner | Suitable Content |
| -- | -- | -- | -- |
| Application data | `/lzcapp/var` | Application | Databases, indexes, configuration, runtime state, and other internal application data |
| Application documents | `/lzcapp/documents/<uid>` | User | Files the user can directly understand, open, migrate, or manage |

The simplest rule is: will this directory contain files the user cannot understand?

1. If yes, save those files to `/lzcapp/var`, not to the application document directory. Examples include application databases, full-text indexes, thumbnail caches, internal configuration, and task state files.
2. If the files are created, imported, downloaded, or expected to be kept by the user, they can be saved to the application document directory. Examples include videos, images, documents, and archives downloaded by a download application.
3. Application document directories are not cleaned by default when the application is uninstalled. Do not rely on application uninstallation to remove their contents.

## Mount Point List

| Mount Directory | Description |
| -- | -- |
| /lzcapp/var | Application storage directory. After application uninstallation, it will only be deleted if "Also clean data" is checked.|
| /lzcapp/cache | Application cache directory. This directory is used to store unimportant data or files. LCMD users can manually clean it in application management. It is suitable for storing log files or temporary files that do not need to be persisted|
| /lzcapp/run/mnt/home | Deprecated compatibility path that keeps the old user document semantics. In single-instance mode, it maps to the global user document root. In multi-instance mode, it maps to the current owner's user document directory. Starting from `v1.7.0`, applications can access this path only after an administrator explicitly grants permission.|
| /lzcapp/documents | Application document root. Actual document data is stored per user under `/lzcapp/documents/<uid>`. Application document directories are always isolated between applications. `document.private` only declares that the current application needs its own application document directory.|
| /lzcapp/pkg | Application static resource directory, containing configuration files and resources carried during application packaging. This directory is read-only.|
| /lzcapp/pkg/content | LPK package content specified by the `contentdir` parameter in `lzc-build.yml`, content built and packaged in the LPK application. This directory is read-only. |

## Usage Constraints

1. `/lzcapp/var`
   - Use this directory for the application's own persistent data.

2. `/lzcapp/run/mnt/home`
   - Use this only for compatibility with the old user document semantics.
   - Starting from `v1.7.0`, applications can access it only after an administrator explicitly grants permission.

3. `/lzcapp/documents`
   - The actual application document data path is always `/lzcapp/documents/<uid>`.
   - Application document directories are always isolated between applications.
   - The system provides this directory only when the application declares the `document.private` permission id in `package.yml.permissions`.
   - Use it only for files that users can directly understand and manage. Do not use it for application databases, caches, indexes, configuration, or runtime state.

## Version and Usage Constraints

1. `/lzcapp/documents` was introduced in `v1.5.0`.
2. Developers should not use the `services.<name>.user` field to handle directory permission issues, and should not run operations such as `chown` in `setup_scripts`.

::: warning
1. Currently, the `lzc-manifest.yml` configuration file of lzcapp only supports mounting folders in the mount point list above.
2. The actual application document data path is always `/lzcapp/documents/<uid>`.
3. Application document directories are always isolated between applications.
4. `/lzcapp/documents` is provided only when the application declares the `document.private` permission id in `package.yml.permissions`.
:::

## Common Questions?

Q: When different family members use the same app, which user's document directory is visible under `/lzcapp/documents`?

A: After the application declares the `document.private` permission id, there is a **single-instance** and **multi-instance** app model (see [Multi-Instance](./advanced-multi-instance)). In both modes, the actual data path is `/lzcapp/documents/<uid>`. This only affects which UID directories are visible to the current application. It does not grant access to other applications' application document directories.

1. For **multi-instance** apps, the application only sees the UID directory of the current instance owner.
2. For **single-instance** apps, the application may see multiple UID directories, and the app should decide which UID directory to write to.

Q: How to access resources mounted by LCMD Cloud Drive within the app container?

A: Configure [enable_media_access: true](https://developer.lazycat.cloud/spec/manifest.html#ext_config) in `lzc-manifest.yml`, then mounted resources are available under `/lzcapp/media/RemoteFS` in the container.
