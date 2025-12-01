# File Access
In the previous chapter, we mentioned that applications can achieve data persistence by saving files to the `/lzcapp/var` directory.

If an application needs to access user files, it only needs to access the path `/lzcapp/run/mnt/home/${username}` in the code, where `username` is the username you use to log into LCMD.

The LCMD system will automatically bind user document data to the `/lzcapp/run/mnt/home` path of the application container for easy reading by the application.

## Mount Point List

| Mount Directory | Description |
| -- | -- |
| /lzcapp/var | Application storage directory. After application uninstallation, it will only be deleted if "Also clean data" is checked.|
| /lzcapp/cache | Application cache directory. This directory is used to store unimportant data or files. LCMD users can manually clean it in application management. It is suitable for storing log files or temporary files that do not need to be persisted|
| /lzcapp/run/mnt/home | User document directory. The system will automatically mount it to the container by default. Data in this directory will not be deleted after application uninstallation (equivalent to the data users see in LCMD Cloud Drive).|
| /lzcapp/pkg | Application static resource directory, containing configuration files and resources carried during application packaging. This directory is read-only.|
| /lzcapp/pkg/content | LPK package content specified by the `contentdir` parameter in `lzc-build.yml`, content built and packaged in the LPK application. This directory is read-only. |

::: warning
1. Currently, the `lzc-manifest.yml` configuration file of lzcapp only supports mounting folders in the mount point list above.
2. /lzcapp/run/mnt/home/ When the `multi-instance` option is not enabled, the container has no user concept, so it will mount to /data/document/. The program needs to handle the user concept itself.
:::

## Common Questions?

Q: Which user's document directory will be mounted when different family members use the same application for the directory `/lzcapp/run/mnt/home`?

A: There is a concept of **single-instance** and **multi-instance** applications here (refer to [Multi-Instance](./advanced-multi-instance) related documentation). Depending on the configuration, the following two situations will occur.

1. When the application is declared as **multi-instance**, `/lzcapp/run/mnt/home` LCMD will automatically mount the document directory according to the current client logged-in user `username`

2. When the application is declared as **single-instance**, `/lzcapp/run/mnt/home` will mount all users' document directories. At this time, the application needs to implement which user's document directory to write files to

Q: How to access resources mounted by LCMD Cloud Drive within the application container?

A: Configure [enable_media_access: true](https://developer.lazycat.cloud/spec/manifest.html#ext_config) in the `lzc-manifest.yml` file, and you can find your mounted resources in the `/lzcapp/media/RemoteFS` directory of the container.
