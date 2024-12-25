# 开发应用常见问题

## 在登录开发者中心前，先确认您的 `lazycat.cloud` 帐号是否具有开发者权限？

在注册 lazycat.cloud 帐号后，您还需要申请下成为开发者，否则会出现没有权限登录的问题。

## 资源文件比较大，该如何打包和发布?

像一些应用中，需要携带一些资源文件（类似模型文件，避免用户启动时候 `长时间下载` 或者 `下载不了` 等问题），则可以将文件打包到镜像中去，然后在镜像启动脚本或者 `entrypoint` 中做后续的操作。

::: warning
拷贝到镜像中的资源文件，不能放在 `/lzcapp/` 的目录下, 这个目录在应用运行的时候，会被覆盖，更详细的说明请看 [访问微服数据](./advanced-file)
:::

如果资源文件比较小(<200M)，也可以将资源文件打包到 lpk 中去，在应用运行的时候，通过访问 `/lzcapp/pkg/content` 目录读取.

## `devshell` 模式下, 将不会打包 `lzc-build.yml` 中指定的 `contentdir`

如果您需要打包 contentdir 中的内容，您可以使用 `lzc-cli project devshell --contentdir`.

## 由于 `/lzcapp/pkg/content` 目录为只读的，会导致打包进去的脚本在当前目录下创建文件失败

`/lzcapp/pkg/content` 这个目录为 lpk 打包进去的资源文件，是不允许修改的。有两种解决方法:

1. 更改脚本中的创建目录，如 `/lzcapp/cache` 或者 `/lzcapp/var`。 详细信息请看 [访问微服数据](./advanced-file)
2. 更改应用的执行目录, 通过 `application.workdir` 的字段指定当前的运行目录。详细信息请看 [application 字段](./app-example-python-description)

## 上架应用的介绍文档在哪里写？

上架应用中，并不会自动读取 readme，也不知道 readme 从何而来，所以应用介绍是在开发者管理界面[点击跳转](https://developer.lazycat.cloud/manage)中填写。

应用列表 -> 提交修改 -> 应用描述
