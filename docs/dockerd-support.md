# dockerd 开发模式

部分开发者希望微服能提供完整的docker套件功能, 针对于这一类用户, 微服系统(需要版本>= v1.1.0)提供了新的机制. 
首先, 用户需要先取得微服的[ssh权限](./ssh), 一旦获取到该权限, 即可通过以下命令开启此服务
```bash
playgroundctl enable
```
调用后系统会下载相应的应用,并且开启服务
```bash
box-test ~ # playgroundctl enable
Installing LPK from URL: https://dl.lazycat.cloud/lzcos/files/cloud.lazycat.app.dockge.lpk
Installation succeeded.
Playground Docker 已启动, 已默认安装Dockge
Playground Docker 配置路径为/lzcsys/var/playground/daemon.json
如需设置docker默认存储位置, 请修改配置文件中的data-root
数据盘默认路径为/data, 如需使用系统固态硬盘, 可设置存储路径为/lzcsys/var/user_save, 固态硬盘空间有限, 请控制储存数据大小在200GiB内
在系统的其他路径中存储的文件, 可能会在重启后丢失!!
系统重启后, 需要开启Dockge应用或执行pg-docker <command>后, docker才会运行
-----本功能仅为临时方案, 后续可能无效!-----
```

:::tip 
请注意, 如需配置该docker的行为,请修改 **/lzcsys/var/playground/daemon.json**, 修改完成后需要执行`systemctl restart playground-docker` 重启服务
:::


开发者可以通过以下两种方式运行自己的容器

### Dockge 
该应用可以在应用列表中访问到, 通过 `dockge` 应用, 用户可以自己编写docker-compose 文件, 部署并且测试

![dockge](./public/dockge.png)

### pg-docker
ssh 登录到微服之后, 用户可以直接使用 `pg-docker` 命令执行docker相关的命令, 通过pg-docker暴露的端口, 能够直接在内网中访问

