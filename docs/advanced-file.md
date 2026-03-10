# 文件访问
上一章我们讲了， 在应用内可以通过保存文件到 `/lzcapp/var` 目录下实现应用数据的持久化。

如果应用需要访问用户文件，在代码中使用稳定路径 `/lzcapp/documents/${username}`。

微服系统会自动将用户文稿数据挂载到应用容器，路径为：

- `/lzcapp/documents`（稳定语义）

## 挂载点列表

| 挂载目录 | 描述 |
| -- | -- |
| /lzcapp/var | 应用存储目录，应用卸载后， 在勾选了 "并清理数据" 才会删除。宿主目录权限固定为 `1777`，运行时会按每个 service 的运行 UID/GID 做 idmapped 挂载。|
| /lzcapp/cache | 应用缓存目录，该目录用于存放不重要的数据或文件，微服用户可以在应用管理里手动进行清理，比较适合存放一些日志文件或不必要持久化的临时文件|
| /lzcapp/documents | 用户文稿根目录。单实例和多实例下路径语义一致，应用通过 `/lzcapp/documents/<username>` 访问目标用户文稿。运行时会按每个 service 的运行 UID/GID 做 idmapped 挂载。|
| /lzcapp/pkg | 应用静态资源目录，包含配置文件及应用打包时携带的资源。该目录为只读。|
| /lzcapp/pkg/content | `lzc-build.yml` 参数 `contentdir` 指定的 lpk 包内容 ，构建打包在 lpk 应用中的内容。该目录为只读。 |

## 权限细节

1. `/lzcapp/var`
   - 宿主真实路径为 `/lzcsys/data/appvar/<deploy_id>`，目录权限为 `1777`。
   - 如果 service 运行用户可解析为 UID/GID，运行时会使用该 UID/GID 进行 idmapped 挂载。

2. `/lzcapp/documents`
   - 宿主真实路径为 `/lzcsys/data/document`（单实例）或 `/lzcsys/data/document/<uid>`（多实例部署视角）。
   - 如果 service 运行用户可解析为 UID/GID，运行时会使用该 UID/GID 进行 idmapped 挂载。

## 版本与使用约束

1. `idmapped mount` 相关权限处理在 `v1.5.0` 引入。
2. `/lzcapp/documents` 在 `v1.5.0` 引入。
3. 开发者不应该使用 `services.<name>.user` 字段处理目录权限问题，也不要使用 `setup_scripts` 执行 `chown` 一类操作。

::: warning
1. 目前 lzcapp 的 `lzc-manifest.yml` 配置文件中仅支持挂载上列挂载点列表中的文件夹。
2. 应用统一使用 `/lzcapp/documents`，避免单实例/多实例切换时额外做路径适配。
3. 在多实例应用中，`/lzcapp/documents` 下只会暴露当前部署用户目录；在单实例应用中，会暴露多个用户目录。
:::

## 常见问题？

Q: 目录 `/lzcapp/documents` 在不同家庭成员使用同一个应用时会看到哪个用户的 document 目录？

A: 这里会有一个应用 **单实例** 和 **多实例** 的概念 (参考 [多实例](./advanced-multi-instance) 相关文档)，两者在路径语义上保持一致，区别只体现在目录可见范围。

1. 在应用声明为 **多实例** 的情况下，`/lzcapp/documents` 只会出现当前实例所属用户的子目录。
2. 在应用声明为 **单实例** 的情况下，`/lzcapp/documents` 会出现多个用户子目录，此时应用需要自行决定将文件写入哪个用户目录。

Q: 如何在应用容器内访问懒猫网盘挂载的资源？

A: 在 `lzc-manifest.yml` 文件中配置 [enable_media_access: true](https://developer.lazycat.cloud/spec/manifest.html#ext_config) 即可在容器的 `/lzcapp/media/RemoteFS` 目录下找到你挂载的资源。
