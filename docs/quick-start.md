# 快速开始

::: info
介绍如何从0开始创建一个自己的懒猫微服应用，并安装到微服中。
:::

## 前置准备

0. 正在运行的懒猫微服客户端，还没有客户端，[点击下载](https://lazycat.cloud/download)安装
1. 微服中安装 [懒猫云开发者工具](https://appstore.lazycat.cloud/#/shop/detail/cloud.lazycat.developer.tools)
2. `ssh` 和 `ssh-copy-id` （开发应用的时候和应用容器连接使用）
3. `rsync` （开发应用是同步开发数据使用）
4. `nodejs` (运行 lzc-cli 使用)

```bash
npm install -g @lazycatcloud/lzc-cli
# 将 lzc-cli 添加 bash/zsh 补全支持
lzc-cli completion >> ~/.zshrc
```

## 创建项目
下面开始使用 `lzc-cli` 去创建一个项目吧!

`lzc-cli project create <project name>` 附带一个命令行设置向导，可以帮助你构建一个基本项目。执行后，会提示你需要创建的项目类型，以及填写对应的信息

```bash
➭ lzc-cli project create firstdemo                                          # 创建你的第一个lzc应用
? 选择项目构建模板 lite                                                        # 根据实际的应用场景选择需要模板
? 请输入应用ID, 如 cloud.lazycat.app.firstdemo cloud.lazycat.app.firstdemo    # 应用ID，尽量使用和 Android PKG ID 兼容的ID
? 请输入应用版本信息 0.0.1                                                     # 版本号
? 请输入应用子域名 firstdemo                                                   # 应用访问域名，要求盒子中唯一
? 请输入应用名称 firstdemo                                                     # 在启动界面中显示的名称
? 应用简单的描述信息 我的第一个懒猫微服开发demo应用                                # （非必填） 应用的基本描述信息，在商店中会显示出来
? 应用主页地址 https://xxxxxxx                                                # （非必填）应用主页
? 应用作者 catdog                                                             # （非必填）开发作者
初始化项目 firstdemo
初始化懒猫云应用
✨ 懒猫云应用 firstdemo 已创建:
  cd firstdemo
🚀 构建 lpk 包
  lzc-cli project build -o firstdemo.lpk
⚙ 将应用安装至设备中:
  lzc-cli app install firstdemo.lpk
```

### 1. lite 模板
`lite` 中就只有创建懒猫微服应用必须的东西，没有额外的东西，创建完成后，整个目录结构如下

``` shell
firstdemo
├── error_pages
│   └── 502.html.tpl
├── lazycat.png
├── lzc-build.yml
├── lzc-manifest.yml
└── README.md
```

`lzc-manifest.yml` 文件中定义的是应用的基本信息，其中大部分的信息都是刚才在应用向导中填写的。内容如下
```yaml
lzc-sdk-version: 0.1                               #指定微服中的SDK版本，如果指定的版本比当前正式版低，将会默认使用正式版
package: cloud.lazycat.app.firstdemo               #应用ID
version: 0.0.1                                     #应用版本
name: firstdemo                                    #应用名称
description: 我的第一个懒猫微服开发demo应用            #应用描述信息
license: https://choosealicense.com/licenses/mit/  #license
homepage: https://xxxxxxx                          #主页
author: catdog                                     #作者
application:                                       #定义应用相关的信息
  subdomain: firstdemo                             #应用访问的域名，比如盒子名称为catdog, 就可以通过 https://firstdemo.catdog.heiyu.space 访问
  routes:                                          #routers 定义应用访问路由
    - /=https://lazycat.cloud                      #这里把所有的访问都转发到 https://lazycat.cloud
  handlers:                                        #handlers 定义应用权限控制，服务错误等状态提示相关的处理方式
    error_page_templates:                          #定义应用服务错误后的展示界面
      '502': /lzcapp/pkg/content/502.html.tpl      #当微服访问应用为502状态码后，根据自定义的模板返回提示语
```

`502.html.tpl` 内容如下
```html
<html>
  <body>
    <h1>
你的程序无法访问了~~~~~~~~
    </h1>
    <p>
原因: {{ .ErrorDetail}}
    </p>
    <p>
      请稍后再试吧
    </p>
  </body>
</html>
```

`error_page_templates` 模板中支持的占位符
  - `StatusCode` `int` 类型，错误的状态码
  - `ErrorDetail` `string` 类型，错误的详细信息

`lzc-build.yml` 为 `lzc-cli` 构建应用`lpk` 过程中用到的构建文件。其内容如下

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
# - routers 指定应用容器的访问路由

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

`devshell` 为方便开发和调试应用的一个 `ssh shell`， 通过 `devshell` 可以访问应用容器本身，点击查看更详细的[文档](./devshell.md)

### 2. Vue3 模板

`lzc-build.yml` 和 `lzc-manifest.yml` 和 `lite` 模板内容基本一致，在 `Vue3` 模板中会调用 `npm init vue@3` 来创建 `Vue3` 项目

### 3. Vue2 模板

`lzc-build.yml` 和 `lzc-manifest.yml` 和 `lite` 模板内容基本一致，在 `Vue2` 模板中会调用 `npm init vue@2` 来创建 `Vue2` 项目

### 4. golang 模板
`lzc-build.yml` 和 `lzc-manifest.yml` 和 `lite` 模板内容基本一致，使用 `go mod init` 来创建项

## 应用构建

使用 `lzc-cli project build` 来构建应用 `lpk`
```bash
➭ lzc-cli project build --help
lzc-cli project build [context]

构建

Options:
  -h, --help     Show help                            [boolean] [default: false]
      --version  Show version number                                   [boolean]
      --log      log level 'trace', 'debug', 'info', 'warn', 'error'
                                                      [string] [default: "info"]
  -o, --output   输出文件                                                   [string]
  -f, --file     指定构建的lzc-build.yml文件        [string] [default: "lzc-build.yml"]
```

在一些项目中，可能需要区分 `release`, `dev` 版本, 可以创建两个不同的 `lzc-build.release.yml` 和 `lzc-build.dev.yml`，然后通过 `-f` 参数指定。

`firstdemo` 执行效果如下:
```
cd firstdemo/
➭ lzc-cli project build
[warn] 跳过执行 buildscript
[info] 输出lpk包 /home/xxx/firstdemo/cloud.lazycat.app.firstdemo-v0.0.1.lpk
```

::: info
`lzc-build.yml` 中的 `buildscript` 被注释了，因为 lite 中没有东西需要构建
:::

## 安装应用Lpk

通过 `lzc-cli app install` 命令进行安装

```bash
➭ lzc-cli app install --help
lzc-cli app install [pkgPath]

部署应用至设备, pkgPath 可以为路径，或者https://,http://请求地址, 如果不填写，将默认为当前目录下的lpk

Options:
  -h, --help     Show help                            [boolean] [default: false]
      --version  Show version number                                   [boolean]
      --log      log level 'trace', 'debug', 'info', 'warn', 'error'
                                                      [string] [default: "info"]
```

`firstdemo` 安装效果如下
```bash
➭ lzc-cli app install cloud.lazycat.app.firstdemo-v0.0.1.lpk
[info] 开始安装应用
/ Installed[info] 安装成功！
[info] 👉 请在浏览器中访问 https://firstdemo.catdog.heiyu.space
```

✨ 你现在已经成功构建自己的懒猫微服应用，并把它安装到微服中去，现在你可以通过上面提示的连接在浏览器中访问它。
