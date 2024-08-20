# 应用开发

通过前面的 [快速开始](./quick-start.md) 和 [微服应用](./lzcapp.md) 两节，知道了 `lzc-manifest.yml` 是用来配置微服应用，那 `lzc-build.yml` 就是用来定义如何开发，构建，最后将应用打包成一个 `lpk`。

下面是一个 `lzc-build.yml` 示例
```yml
# 整个文件中，可以通过 ${var} 的方式，使用 manifest 字段指定的文件定义的值

# buildscript
# - 可以为构建脚本的路径地址
# - 如果构建命令简单，也可以直接写 sh 的命令
# buildscript: ./build.sh

# manifest: 指定 lpk 包的 manifest.yml 文件路径
manifest: ./lzc-manifest.yml

# contentdir: 指定打包的内容，将会打包到 lpk 中
contentdir: ./error_pages

# pkgout: lpk 包的输出路径
pkgout: ./

# icon 指定 lpk 包 icon 的路径路径，如果不指定将会警告
# icon 仅仅允许 png 后缀的文件
icon: ./lazycat.png

# devshell 自定义应用的开发容器环境
#   routers 指定应用容器的访问路由

# devshell 没有指定 image 的情况，将会默认使用 registry.lazycat.cloud/lzc-cli/devshell:v0.0.5
# devshell:
#   routers:
#     - /=http://127.0.0.1:8080

# devshell 指定 image 的情况
# devshell:
#   routes:
#     - /=http://127.0.0.1:3000
#   image: registry.lazycat.cloud/lzc-cli/devshell:v0.0.5

# devshell 指定构建Dockerfile
# image 字段如果没有定义，将默认使用 ${package}-devshell:${version}
# devshell:
#   routes:
#     - /=http://127.0.0.1:3000
#   image: ${package}-devshell:${version}
#   pull_policy: build
#   build: .

# dvshell 指定开发依赖的情况
# 这种情况下，选用 alpine:latest 作为基础镜像，在 dependencies 中添加所需要的开发依赖即可
# 如果 dependencies 和 build 同时存在，将会优先使用 dependencies
# devshell:
#   routes:
#     - /=http://127.0.0.1:3000
#   dependencies:
#     - go
#     - vim
#   # setupscript 每次进入到app container后都会执行的配置脚本
#   # - 可以为脚本的路径地址
#   # - 如果构建命令简单，也可以直接写 sh 的命令
#   # setupscript: export GOPROXY=https://goproxy.cn
#   # setupscript: ./setupscript.sh
#   setupscript: |
#     export GOPROXY=https://goproxy.cn
#     export npm_config_registry=https://registry.npmmirror.com
```

## contentdir 字段

指定打包的内容，将会打包到 lpk 中，对应应用容器中的 `/lzcapp/pkg/content/` 目录

## devshell 字段

`devshell` 为 `lzc-cli` 提供的一种开发方式，用户可以通过 `devshell` 连接到应用容器中去，在容器内部你可以直接操控整个容器本身，比如安装所需要的依赖，启动相关的服务等。

`devshell` 会使用 `rsync` 将代码同步到应用容器中的，只要文件有变动，就会触发同步逻辑。 `rsync` 会遵循目录下的 `.gitignore`，被忽略的文件将不会被同步.

::: tip
可能大部分情况下，你不想将 `.git` 也同步到容器中去，你可以在项目目录下创建一个 `.rsync-filter` 文件，里面内容如下
```.rsync-filter
- .git
```
从而将 `.git` 目录忽略
:::

## devshell.routers

`devshell.routers` 中 `routers` 的规则和 [application.routers](./lzcapp.md#application-routers) 保持一致，但在 `devshell.routers` 中定义的会具有更高的优先级，如果 `application.routers` 和 `devshell.routers` 中都定义了相同前缀的路由，将只会应用 `devshell.routers` 中的路由。

::: tip
有些情况下，开发者会在本地的机器中启动前端界面，而在微服中启动的后端。这种情况下，你可以在routers中指定你当前的客户端的地址，从而避免在盒子中安装和前端相关的依赖。

```yml
devshell:
  image: registry.lazycat.cloud/golang:1.21.0-alpine3.18
  routes:
    - /=http://${LocalIP}:5173
```

`${LocalIP}` 是 `lzc-cli` 做的一个特殊处理，会自动获取当前的懒猫微服客户端网卡的 `ipv6` 地址。通过这个地址，微服中的服务可以就可以访问到本地的服务。
:::

## devshell.setupscript

每次进入到应用容器时都会执行的配置脚本。比较常用的操作是用来配置一些环境变量。如

```yml
devshell:
  routes:
    - /=http://127.0.0.1:3000
  dependencies:
    - go
    - vim
  # setupscript 每次进入到app container后都会执行的配置脚本
  # - 可以为脚本的路径地址
  # - 如果构建命令简单，也可以直接写 sh 的命令
  # setupscript: export GOPROXY=https://goproxy.cn
  # setupscript: ./setupscript.sh
  setupscript: |
    export GOPROXY=https://goproxy.cn
    export npm_config_registry=https://registry.npmmirror.com
    export GOCACHE='/lzcapp/cache/go/go-build'
    export GOMODCACHE='/lzcapp/cache/go'
```



::: tip
1. `yml` 文件中使用 `|` 支持多行
2. 将 `GOCACHE` 和 `GOMODCACHE` 放在缓存目录下，在 `golang` 构建的很有用
:::


## devshell.image

`devshell.image` 指定你应用容器的开发镜像，目前 `devshell` 支持三种构建模式
    1. 指定构建好的 `image` 镜像
    2. 只指定需要的依赖（`lzc-cli` 中会自动在微服基于 `alpine:latest` 构建）
    3. 指定构建的 `Dockerfile` 文件 （`lzc-cli` 中会根据提供的 `Dockerfile` 和 `context` 在微服上构建）


## 1. 指定构建好的 `image` 镜像

这个可以直接使用公网上的 docker image ，但需要考虑所在微服地区能访问到的地址，否则可能无法获取镜像而报错。

## 2. 指定所需要的依赖 `devshell.dependencies`
```yml
devshell:
  routes:
    - /=http://127.0.0.1:3000
  dependencies:
    - go
    - vim
```

通过 `devshell.dependencies` 指定所需要安装的依赖. `lzc-cli` 通过以下模板来构建所需镜像.
```Dockerfile
FROM alpine:latest

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

RUN apk add --no-cache bash ${dependencies} \
  && echo "root:root" | chpasswd

CMD ["sleep", "infinity"]
```

## 3. 指定构建的 `Dockerfile` 文件
```yml
# image 字段如果没有定义，将默认使用 ${package}-devshell:${version}
devshell:
  routes:
    - /=http://127.0.0.1:3000
  image: ${package}-devshell:${version}
  pull_policy: build
  build: .
```

`${package}` 和 `${version}` 从 `manifest` 中的获取信息。`lzc-cli` 会根据 `build` 下的 `Dockerfile` 和 `build context` 打包到微服中进行镜像构建。`lzc-cli` 在采集 `context` 中的会遵循 `.dockerignore`。


## 使用 `lzc-cli project devshell` 开发

```bash
➭ lzc-cli project devshell --help
lzc-cli project devshell [context]

进入盒子的开发环境

Options:
  -h, --help        Show help                         [boolean] [default: false]
      --version     Show version number                                [boolean]
      --log         log level 'trace', 'debug', 'info', 'warn', 'error'
                                                      [string] [default: "info"]
  -f, --force       强制重新构建                                             [boolean]
  -c, --config      devshell配置文件             [string] [default: "lzc-build.yml"]
      --contentdir  同时打包 lzc-build.yml 中指定的 contentdir 目录              [boolean]
```

在 `lzc-build.yml` 和 `lzc-manifest.yml` 目录下执行 `lzc-cli project devshell` 即可。

1. 如果应用没有处于 `devshell` 模式下, 执行 `lzc-cli project devshell` 会把开发镜像部署到微服中去
2. 如果应用已经处于 `devshell` 模式下，再次执行 `lzc-cli project devshell`  将直接进到应用容器的 `shell` 中
3. 可以使用 `lzc-cli project devshell -f` 进行强制重新部署
4. 更新 `lzc-build.yml` 和 `lzc-manifest.yml` 文件后，也会重新部署开发环境
