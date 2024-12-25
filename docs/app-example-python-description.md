# Python 应用配置详解
上一章我们讲了怎么构建第一个 Python 应用， 这一章我们详细的分析 Python 应用的构建细节。

## lzc-build.yml

lzc-build.yml 这个文件是生成 lpk 的应用安装包的配置文件， 这个脚本的内容用一句话来形容： 根据 `buildscript` 定义的脚本， 把 `contentdir` 下面的所有文件打包成一个 lpk 压缩包， 最后安装到微服中。

## lzc-manifest.yml

lzc-manifest.yml 是控制应用 Meta 信息的配置文件。

先介绍一下这个配置文件基本的关键字和用处：
- `name`: 应用名称
- `package`: 应用的子域名， 如果不上架懒猫微服应用商店， 这个名字可以随便取
- `version`: 版本号
- `description`: 应用描述
- `license`: 应用的发行许可证
- `homepage`: 项目主页
- `author`: 作者信息

这个文件最重要的是 `application` 字段：

```shell
application:
  subdomain: todolistpy
  routes:
    - /=file:///lzcapp/pkg/content/web
    - /api/=exec://3000,./lzcapp/pkg/content/backend/run.sh
```

- `subdomain: todolistpy`

  应用子域名， 和上面的 `package` 字段的域名相关联。

- ​`/=file:///lzcapp/pkg/content/web`

  这个路由表示， 当用户访问应用时， 也就是访问路由 `/` 时， 应用程序会自动返回 `/lzcapp/pkg/content/web` 目录下的 `index.html` 文件。 `/lzcapp/pkg/content` 其实就是对应前面 `lzc-build.yml` 文件中的 `contentdir` 目录。

- ​`/api/=exec://3000,./lzcapp/pkg/content/backend/run.sh`:

  这个路由表示， 当用户访问路由 `/api/`​ 时， 应用程序会启动 `./lzcapp/pkg/content/backend/run.sh` 脚本提供后端服务， 后端服务脚本监听 3000 端口。


`application` 字段下具有以下字段:

| 字段            | 说明                                                                     | 默认                                     |
|-----------------|--------------------------------------------------------------------------|------------------------------------------|
| background_task | [配置后台任务](./advanced-background)                                    | false                                    |
| subdomain       | 配置应用子域名                                                           | <必填项>                                 |
| routes          | [配置应用规则](./advanced-route)                                         |                                          |
| public_path     | [配置外网API](./advanced-public-api)                                     |                                          |
| ingress         | [配置外网端口](./advanced-public-api)                                    |                                          |
| multi_instance  | [配置多实例(同一个应用，各用户数据隔离)](./advanced-multi-instance)      | false                                    |
| workdir         | 指定应用的启动目录，若不设置或目录不存在则保持使用container的WORKDIR信息 |                                          |
| usb_accel       | 挂在/dev/bus/usb到容器                                                   | false                                    |
| gpu_accel       | 是否允许使用硬件加速                                                     | false                                    |
| kvm_accel       | 是否允许使用 kvm                                                         | false                                    |
| file_handler    | 声明本app支持操作的文件类型，[应用关联](./advanced-mime)                 |                                          |
| environment     | 填写 application 容器的环境变量                                          |                                          |
| image           | 指定应用的镜像，如果为空将使用默认的                                     | registry.lazycat.cloud/lzc/lzcapp:3.20.3 |
| health_check    | 定义 application 的 health_check 行为                                    |                                          |
| handlers        | [定义应用错误时的展示模板](./advanced-error-template)                                                 |                                          |

::: details

```yml
package: abc.example.com # app的唯一id,上架到商店需要保证不要冲突,尽量使用开发者自己的域名作为后缀.
version: 2.0.2           #app的版本

name: 测试abc   #软件名称,会显示在启动器之类的地方
description: 简单易用的英语学习软件

license: https://choosealicense.com/licenses/mit/  #软件本身的license
homepage: http://github.com/snyh/abc #软件的主页,会在商店等地方体现
author: snyh@snyh.org #lpk的作者,会在商店等地方体现

unsupported_platforms: # 不支持的平台, 不写则表示全平台支持. lpk本身是可以被安装的,但下面列表中的平台无法打开此软件
  - linux
  - macos
  - windows
  - android
  - ios
  - tvos


#application作为一个特殊的container运行，对应的service名称为固定的`app`，其他service可以通过此名称与app进行通讯
application:
  background_task: false #是否存在后台任务，若存在则系统不会对此app进行主动休眠等操作

  subdomain: abc  #期望的app域名，如果系统中已经有对应域名则会提示用户选择其他域名。最终app分配到的域名以/lzcapp/run/app.subdomain为准

  routes:
    - /api/=exec://8000,/lzcapp/pkg/content/bin/backend     #格式与/usr/bin/lzcinit -up参数一致
    - /api/=http://service.appid.lzcapp:8000            #多实例应用会自动在route里加上uid
    - /=file:///lzcapp/pkg/content/dist/

  public_path:
    - /api/public  #默认情况下所有路径都需要登陆后才能访问，public_path之下的路径允许非登陆情况下访问

  ingress:
    - protocol: tcp     #tcp or udp
      port: 22          #需要曝露的端口号
      service: db       #为空则为此app容器内的端口,也可以指定为db等其他service的名称

  multi_instance: true # 是否启用多实例

  workdir: /lzcapp/pkg/content/ #设置lzcinit以及后续子进程的WORKDIR,若不设置或目录不存在则保持使用container的WORKDIR信息

  usb_accel: false # 挂在/dev/bus/usb到容器
  gpu_accel: false # 是否允许使用硬件加速
  kvm_accel: true  # enable后会挂在/dev/kvm和/dev/network-host到所有service中

  file_handler: # 声明本app支持操作的文件类型，mime至少存在一条记录，actions至少要支持open
    mime:  #按照mime类型注册到系统
      - x-scheme-handler/http
      - x-scheme-handler/https
      - text/html
      - application/xhtml+xml
      - x-lzc-extension/km      # app支持.km文件名后缀
    actions:  #打开对应文件的url路径,由文件管理器等app调用
      open: /open?file=%u   #%u是某个webdav上的具体文件路径，一定存在
      new:  /open?file=%u   #%u是某个webdav上的具体文件路径，不一定存在
      download: /download?file=%u #%u是某个webdav上的具体文件路径，一定存在

  environment:
    - MYPASSWORD=123456

  image: alpine:3.16  #可选的运行环境，为空则使用sdk对应版本的镜像。若上架到商店，则此处的镜像必须上传到商店仓库统一托管。

  health_check:
    test_url: http://backend.appid.lzcapp:8080 # 进行健康检查的url，如果返回大于500则健康检查失败
    start_period: 90s # 应用启动超时（如果应用容器启动后过了指定时间段后，健康检查仍然无法通过，则视为应用启动失败）
    disable: false #禁用后则系统不会执行自动健康检测逻辑,但image中本身存在的health_check依然会执行

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
      502: /lzcapp/pkg/content/errors/502.html.tpl
      404: /lzcapp/pkg/content/errors/404.html.tpl



services: #传统docker镜像启动方式，如果需要数据库等配套容器一起运行则可以在这里申明。传统app如nextcloud、aria2c也可以使用这种方式进行兼容运行
  backend:
    image: alpine:3.18

    depends_on:
      - db

  db: #目前只支持以下参数，network,ipc之类的配置字段(故意)不支持
    image: bitnami/wordpress:5.8.2
    environment:
      - ALLOW_EMPTY_PASSWORD=yes
      # oauth相关的环境变量
      - LAZYCAT_AUTH_OIDC_CLIENT_ID=xxx
      - LAZYCAT_AUTH_OIDC_CLIENT_SECRET=xxx
      - LAZYCAT_AUTH_OIDC_ISSUER_URL=xxx


    # 仅支持以下挂载点:
    # - /lzcapp/run
    # - /lzcapp/run/mnt/home
    # - /lzcapp/var
    # - /lzcapp/cache
    # - /lzcapp/pkg
    binds:
      - /lzcapp/run/mnt/home:/home  #将/lzcapp/run/mnt/home(即用户文稿)目录挂在到容器内的/home目录
      - /lzcapp/var/db:/data
      - /lzcapp/cache/db:/cache
      - /lzcapp/pkg/content/entrypoint.sh:/entrypoint.sh # 挂载lpk包内的文件

    entrypoint: /bin/sh -c
    command: "/usr/bin/nextcloud"

    depends_on:
      - ui

    # network_mode 仅支持host模式，开启后此service可以访问所有网卡，但失去lzcdns特性
    # 非必要尽量不要使用此模式，需要谨慎处理代码，存在很高安全风险
    # 如果要在network=host service中提供内部服务，请监听在`host.lzcapp`这个内部IP上，不要直接监听0.0.0.0
    network_mode: "host"

    # cpu_shares默认值为 1024，将此值调小可以降低容器的优先级。只有在 CPU 周期受到限制时，这种限制才会生效。
    # 当 CPU 周期充足时，所有容器会使用所需的全部 CPU 资源。cpu_shares 不会阻止容器在 Swarm 模式下被调度。
    # 它为可用的 CPU 周期优先分配容器的 CPU 资源，但并不保证或保留任何特定的 CPU 访问权限。
    cpu_share: 2
    # cpus用于指定容器可以使用的可用 CPU 资源量。例如，如果主机机器有两个 CPU，并且您设置 --cpus="1.5"，
    # 则容器保证最多使用一个半的 CPU。
    cpu: 2

```

:::

## 保存数据的路径
当后端需要存储文件或者数据库时， 请确保文件放在 `/lzcapp/var`​ 目录下， 存在其他目录下的文件会在应用 Docker 重启后被系统清空。
