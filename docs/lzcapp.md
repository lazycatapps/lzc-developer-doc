# 懒猫微服应用

::: tip
如果你是有经验的开发者，可以直接查看 [manifest](https://gitee.com/linakesi/lzc-sdk/blob/master/docs/manifest.yml) 的字段说明
:::

![lzcos应用布局](/lzcos-app.png)

在懒猫微服中，每一个应用都是独立运行的，应用的空间中可以启动别的 `sidecar` 服务。

在上图中的 `cloud.lazycat.awesome.app` 内部中，其中 **`app` 服务的名称是固定的，并会固定使用 80 和 81 两个端口** ，而其他 sidecar 服务名称是自定义的。而 `app` 服务通过 `lzc-manifest.yml` 中的 `application` 字段配置。

```yml
package: abc.example.com #app的唯一标识符
version: 2.0.2           #app的版本
name: 测试abc
description: 简单易用的英语学习软件
license: https://choosealicense.com/licenses/mit/
homepage: http://github.com/snyh/abc #出现bug时候提交反馈的地方
author: snyh@snyh.org

#application作为一个特殊的container运行，对应的service名称为固定的`app`，其他service可以通过此名称与app进行通讯
application:
  subdomain: abc  #期望的app域名

  public_path:
    - /api/public  #默认情况下所有路径都需要登陆后才能访问，public_path之下的路径允许非登陆情况下访问

  background_task: false #是否存在后台任务，若存在则系统不会对此app进行主动休眠等操作

  gpu_accel: false # 是否允许使用硬件加速

  routes:
    - /api/=exec://8000,/lzcapp/pkg/content/bin/backend
    - /db/=http://db.abc.example.com.lzcapp:3306
    - /=file:///lzcapp/pkg/content/dist/

  handlers:
    # 当routes中https/http/exec类型的反代出现错误时，则渲染对应模板。
    # 若错误类型为无法返回任何数据，则会生成一个502响应，比如上游游服务器不存在或网络不通等完全获取不到一个http response的情况。
    #
    # 其他情况则根据http response status code，选择对应的模板
    # 若命中错误处理页面, 则http response status code本身不会进行修改
    #
    # 页面渲染使用此数据结构
      # struct {
      #    StatusCode int
      #    ErrorDetail string #无法获取http response的情况下，此字段会显示对应错误信息，并将StatusCode设置为502
      # }
    error_page_templates:
      '502': /lzcapp/pkg/content/errors/502.html.tpl
      '404': /lzcapp/pkg/content/errors/404.html.tpl

  ingress:
    - protocol: tcp     #tcp or udp
      port: 22          #需要曝露的端口号
      service: db       #为空则为此app容器内的端口,也可以指定为db等其他service的名称


  image: alpine:3.16  #可选的运行环境，为空则使用sdk对应版本的镜像。若上架到商店，需要确保该镜像在用户端能正常访问

  depends_on:
    - db

  user_app: true # 是否启用多实例

  health_check:
    test_url: http://backend.appid.lzcapp:8080 # 进行健康检查的url，如果返回大于500则健康检查失败
    start_period: 90s # 应用启动超时（如果应用容器启动后过了指定时间段后，健康检查仍然无法通过，则视为应用启动失败）

services:
  db:
    image: mysql
```

## `application`
上面基本字段已经在[快速上手](./quick-start.md)中介绍，这里主要介绍 `application` 字段下的配置

## `application.routers`

定义应用的访问路由，支持以下方式使用

1. `/api/=exec://8000,/lzcapp/pkg/content/bin/backend` 执行 `/lzcapp/pkg/content/bin/backend`程序, 并将应用的 `/api/` 的请求转发到 `8000` 端口中。

::: tip
一般来说, `/lzcapp/pkg/content/bin/backend` 中会监听 `8000` 端口，但这个并不是强制要求的，你可以通过这个和 `app` 固定占用的 `80` 端口来实现初始化执行脚本。如 `/__init=exec://80,/init.sh`
:::

2. `/db/=http://db.abc.example.com.lzcapp:3306` 将 `/db/` 请求转发到一个公网或者其他 sidecar 服务中去。

::: tip
在微服中可以通过 http://<service_name>.<pkg.id>.lzcapp 来访问同一个应用中的 sidecar 服务，甚至访问其他的应用中的服务也是支持的.
:::

3. `/=file:///lzcapp/pkg/content/dist/` 将 `/lzcapp/pkg/content/dist/` 作为目录，启动静态文件http服务

## `application.ingress`
在大部分的情况下，微服中的应用都可以通过 `https://<app_domain>.<box_name>.heiyu.space/` 的方式访问，但还是有些应用需要直接访问应用本身暴露的端口，像应用中装个 `sshd`

可以使用 `ingress` 来定义应用需要暴露出来的端口和网络协议，支持 `tcp` 和 `udp`

```yml
  ingress:
    - protocol: tcp        #tcp or udp
      port: 22333          #需要曝露的端口号
      service: sshd        #为空则为此app容器内的端口,也可以指定为db等其他service的名称 (假设 sshd 中具有用户 user)
```

安装完成后，可以在启动懒猫云客户端的机器上，使用 `ssh -p 22333 user@<app_domain>.<box_name>.heiyu.space` 登录到 `sshd` 容器中去


## `services`

定义应用的 `sidecar` 服务，格式和 `docker-compose`一样，但做了限制，以下为一个向量数据库的使用示例
```yml
services:
  weaviate:
    command: --host 0.0.0.0 --port 8080 --scheme http
    image: registry.lazycat.cloud/weaviate:1.24.8
    binds:
      - /lzcapp/var/vdb:/var/lib/weaviate
    environment:
      - QUERY_DEFAULTS_LIMIT=25
      - AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true
      - PERSISTENCE_DATA_PATH=/var/lib/weaviate
      - DEFAULT_VECTORIZER_MODULE=none
      - ENABLE_MODULES=
      - CLUSTER_HOSTNAME=vector_db
```

## 资源文件

在 `app` 服务容器中，会自动把下面几个目录挂载，其他的 sidebar 也可以使用 services 中的使用 `binds` 进行绑定到容器中。

```bash
/lzcapp/run               # lzcos 系统相关的文件
/lzcapp/run/mnt/home      # lzcos 用户家目录 /home/$uid/xxxx
/lzcapp/var               # 应用持久化数据目录
/lzcapp/cache             # 应用缓存数据目录
/lzcapp/pkg               # 应用通过lpk安装进来的数据目录
```

## `/lzcapp/pkg`

`lpk` 的微服应用的安装包，里面有应用所需要的各种文件（比如前端界面的构建dist目录，后端运行的二进制文件等）。资源文件是在 `lzc-build.yml` 中的 `contentdir` [查看更多](./devshell.md#contentdir)的定义，在构建的时候，你可以将需要携带的资源文件放在这个目录下，构建完成后，会把里面的资源文件打包到 `lpk` 中。

在一个应用安装完成后，`lpk` 中的资源会放置在 `/lzcapp/pkg` 下面用一个真实的应用示例

```bash
/ # tree -L 3 /lzcapp/pkg
/lzcapp/pkg
├── content                                # 对应 lzc-build.yml 中指定的 contentdir 字段
│   ├── dist
│   │   ├── assets
│   │   ├── favicon-128x128.png
│   │   ├── favicon-256x256.png
│   │   ├── favicon-48x48.png
│   │   ├── favicon-512x512.png
│   │   ├── favicon-safari-512.png
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── loading.png
│   │   ├── manifest.webmanifest
│   │   ├── sw.js
│   │   ├── sw.js.map
│   │   ├── workbox-27b29e6f.js
│   │   └── workbox-27b29e6f.js.map
│   ├── env.sh
│   └── lzc-photo
├── icon.png                             # lzc-build.yml 中指定的 icon 文件
└── manifest.yml                         # 对应的 lzc-manifest.yml 文件
```

## `/lzcapp/var`

这个目录为应用持久化数据存储的目录，里面的数据只有在用户卸载应用后才会被清理。

在上面的[示例](./lzcapp.md#services)中向量数据库 service 中的，数据库的存储目录就在 `/lzcapp/var` 下。

## `/lzcapp/cache`

这个目录为应用缓存数据存储的目录，里面的数据在重启应用后也不会丢失，但可能会被用户在应用管理界面中清理缓存数据而清理掉。
