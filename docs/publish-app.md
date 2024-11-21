# 发布自己的第一个应用

1. 在发布应用前， 您需要[注册](https://lazycat.cloud/login?redirect=https://developer.lazycat.cloud/)成为懒猫微服的开发者。

2. 提交应用到商店审核:

    - [打开管理界面](https://developer.lazycat.cloud/manage)， 根据界面上的引导提交审核。

    - 或者通过命令行工具 `lzc-cli` (1.2.43 及以上版本) 提交审核， 如何安装 `lzc-cli` 请参考 [开发环境搭建](https://developer.lazycat.cloud/lzc-cli.html)

        ```bash
        lzc-cli project build
        lzc-cli appstore publish ./your-app.lpk
        ```

# LPK 引用镜像处理

lpk 应用中 manifest.yml 包含所依赖**启动环境镜像**和**依赖服务镜像**。

`manifest.yml` 文件中所有通过 image 字段引用的镜像文件须上传至懒猫微服官方镜像源。请通过 `lzc-cli appstore copy-image <image-name>` 将镜像上传。执行命令后，将获取官方源镜像名如 `registry.lazycat.cloud/<community-username>/<image-name>` 。

待审核 LPK 应用中**引用镜像**需要为公开访问的镜像，使审核员能够正常安装该应用。须要保证使用 `copy-image` 子命令上传的**被上传镜像**可被公开正常访问。若 LPK 引用镜像为非公开镜像，将致使上传失败。

```
$ lzc-cli appstore copy-image <被上传镜像>
# 上传完成后将打印  registry.lazycat.cloud/<community-username>/<被上传镜像>
```

注：被上传镜像若未被 lpk **引用**，将会被**定期清理**。

示例：
```
user@host:~$ lzc-cli appstore copy-image redis/redis-stack:latest
Waiting ... ( copy redis/redis-stack:latest to lazycat offical registry)
lazycat-registry: registry.lazycat.cloud/vim/redis/redis-stack:latest
```
