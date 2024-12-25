# 文件访问
上一章我们讲了， 在应用内可以通过保存文件到 `/lzcapp/var` 目录下实现应用数据的持久化。

如果应用需要访问用户的文件， 只需要在代码中访问路径 `/lzcapp/run/mnt/home/${username}` 即可， `username` 是您登录微服的用户名。

微服系统会为自动绑定用户的文稿数据到应用容器的 `/lzcapp/run/mnt/home` 路径， 方便应用自行读取。

## 挂载点列表

| 挂载目录 | 描述 |
| -- | -- |
| /lzcapp/var | 应用存储目录 |
| /lzcapp/cache | 应用缓存目录 |
| /lzcapp/run/mnt/home | 用户 document 目录，系统会默认自动挂载到容器 |
| /lzcapp/pkg | 应用静态资源目录，包含配置文件及应用打包时携带的资源。该目录为只读。|
| /lzcapp/pkg/content | `lzc-build.yml` 参数 `contentdir` 指定的 lpk 包内容 | 构建打包在 lpk 应用中的内容 |

::: warning
目前 lzcapp 的 `lzc-manifest.yml` 配置文件中仅支持挂载上列挂载点列表中的文件夹。
:::

## 常见问题？

Q: 目录 `/lzcapp/run/mnt/home` 在不同家庭成员使用同一个应用时会挂载哪个用户的 document 目录？

A: 这里会有一个应用 **单实例** 和 **多实例** 的概念 (参考 [多实例](./advanced-multi-instance) 相关文档)，此时会根据配置出现以下两种情况。

1. 在应用声明为 **多实例** 情况时 `/lzcapp/run/mnt/home` 微服会自动根据当前客户端登录用户 `username` 挂载 document 目录

2. 在应用声明为 **单实例** 情况时 `/lzcapp/run/mnt/home` 会将全部用户的 document 目录挂载进去，此时需要应用自行实现需要将文件写入哪个用户的 document 目录
