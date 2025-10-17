# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

这是懒猫微服(Lazycat Cloud)的开发者文档项目,使用 VitePress 构建的静态文档网站。懒猫微服是一个新一代的私有云产品,提供外网穿透、网络安全传输、容器管理、应用构建和分发等基础设施。

## 重要原则

- **文档语言**:所有文档内容必须使用中文编写
- **代码注释**:配置文件和代码中的注释使用中文
- **行尾规范**:确保所有文件行尾没有多余的空格

## 常用命令

### 开发命令
```bash
npm install              # 安装依赖
npm run docs:dev         # 启动开发服务器(默认端口 5173,支持热重载)
npm run docs:build       # 构建生产版本(输出到 docs/.vitepress/dist)
npm run docs:preview     # 预览生产版本
```

### 自定义端口
```bash
npm run docs:dev -- --port 3000    # 指定端口启动开发服务器
```

### Docker 部署
```bash
npm run docs:build                              # 先构建静态文件
docker build -f deploy/Dockerfile -t lzc-developer-doc .    # 构建镜像
docker run -p 8080:80 lzc-developer-doc         # 运行容器
```

## 项目架构

### 技术栈
- **构建工具**: VitePress (基于 Vite 和 Vue 的静态站点生成器)
- **前端框架**: Vue 3
- **部署方式**: Docker + Nginx

### 目录结构
```
docs/                          # 文档源文件目录
├── .vitepress/               # VitePress 配置目录
│   ├── config.mts            # 站点配置文件(导航、侧边栏、主题等)
│   └── dist/                 # 构建输出目录
├── index.md                  # 首页
├── introduction.md           # SDK 介绍
├── spec/                     # 规范文档
│   ├── manifest.md          # lzc-manifest.yml 规范
│   └── build.md             # lzc-build.yml 规范
├── api/                      # API 文档
│   ├── javascript.md        # JavaScript SDK API
│   └── golang.md            # Golang SDK API
├── advanced-*.md            # 高级功能文档
├── app-*.md                 # 应用开发示例
└── changelogs/              # 版本更新日志

deploy/                        # 部署相关文件
├── Dockerfile                # Docker 镜像构建文件
├── nginx.conf                # Nginx 配置
├── docker-entrypoint.sh      # 容器启动脚本
├── Makefile                  # 部署自动化脚本
└── Jenkinsfile               # CI/CD 配置
```

### 配置文件说明

#### docs/.vitepress/config.mts
站点的核心配置文件,包含:
- 站点元信息(标题、描述)
- 导航栏配置(nav)
- 侧边栏配置(sidebar) - 组织了完整的文档结构
- 搜索配置(本地搜索)
- 主题配置(中文界面)
- Markdown 配置(行号、代码块标签等)

#### package.json
仅包含 VitePress 的开发依赖和三个 npm scripts,项目结构简洁

## 文档内容组织

文档按以下主题组织:

1. **欢迎** - 产品介绍、理念、架构、社区规则
2. **快速入门** - 开发模式、环境搭建、Hello World
3. **开发应用** - Python/Golang 应用示例、DevShell 开发模式
4. **高级技巧** - 启动依赖、文件访问、数据库、路由规则、环境变量等
5. **规范列表** - lzc-build.yml 和 lzc-manifest.yml 规范文档
6. **API 文档** - JavaScript 和 Golang SDK API 参考
7. **版本日志** - 系统版本更新记录

## 核心概念

### 懒猫微服应用开发
- **应用配置**: lzc-manifest.yml (定义应用部署配置、路由、服务等)
- **构建配置**: lzc-build.yml (定义构建脚本、依赖、打包规则)
- **SDK**: 支持 Go 和 JavaScript/TypeScript,提供 gRPC/gRPC-Web API
- **应用打包**: LPK 格式(LazyCAT Package)
- **部署模式**: 容器化部署,支持多实例、GPU 加速、后台常驻等

### 重要配置字段
- `package`: 应用唯一 ID(全球唯一,建议以域名开头)
- `application`: lzcapp 核心服务配置
- `services`: Docker 容器服务配置
- `routes`/`upstreams`: HTTP 路由规则
- `ingress`: TCP/UDP 服务配置

## 开发工作流

### 文档开发流程
1. **修改文档**: 编辑 docs/ 目录下的 .md 文件
2. **本地预览**: 运行 `npm run docs:dev` 查看实时效果
3. **构建验证**: 运行 `npm run docs:build` 确保构建成功
4. **提交代码**: Git 提交并推送

### 应用开发流程
1. **环境准备**: 安装 Node.js、lzc-cli、懒猫开发者工具
2. **项目创建**: `lzc-cli project create <name>`
3. **开发调试**: `lzc-cli project devshell` 进入开发容器
4. **构建应用**: `lzc-cli project build -o release.lpk`
5. **安装测试**: `lzc-cli app install release.lpk`
6. **发布商店**: `lzc-cli appstore publish ./release.lpk`

## 故障排除

### 端口冲突
VitePress 会自动选择下一个可用端口,或使用 `--port` 参数指定端口

### 构建失败
检查:
- Node.js 版本 >= 16
- 依赖是否正确安装
- Markdown 文件语法是否正确

### Docker 构建问题
必须先运行 `npm run docs:build` 生成静态文件,Dockerfile 依赖 docs/.vitepress/dist 目录

## manifest.yml 完整字段参考模板

> 此模板包含所有可用字段及详细注释,实际使用时按需选择。
> 详细的字段规范说明请查看:[docs/spec/manifest.md](docs/spec/manifest.md)
>
> **注意**: `compose_override` 配置项在 lzc-build.yml 中,不在 manifest.yml 中

```yaml
# ========== 一、ManifestConfig 顶层配置 ==========

# --- 基本信息字段 ---
package: cloud.lazycat.app.example        # 应用唯一 ID (全球唯一,建议以域名开头)
version: 1.0.0                            # 应用版本号
name: 示例应用                             # 应用名称
description: 这是一个包含所有字段的示例应用  # 应用描述
usage: |                                  # 使用须知 (首次访问时渲染,支持多行)
  1. 首次使用请先配置...
  2. 注意事项...
license: MIT                              # License 说明
homepage: https://example.com             # 应用主页
author: 开发者名称                         # 作者名称 (商店账号优先级更高)
min_os_version: v1.3.0                    # 最低系统版本要求 (不满足则拒绝安装)

# --- 其他配置字段 ---
unsupported_platforms:                    # 不支持的平台列表
  - ios
  - android
  # 可选值: ios, android, windows, macos, linux, tvos

# --- 实验性配置 ExtConfig ---
ext_config:
  enable_document_access: true            # 挂载 document 目录到 /lzcapp/run/mnt/home
  enable_media_access: true               # 挂载 media 目录到 /lzcapp/run/mnt/media
  disable_grpc_web_on_root: false         # 不劫持 grpc-web 流量 (配合新版 sdk)
  default_prefix_domain: app              # 启动器打开的域名前缀 (不含 .)

# --- 本地化配置 (需 lzc-os >= v1.3.0) ---
locales:
  zh:
    name: 示例应用
    description: 这是一个中文描述
    usage: 中文使用说明
  zh_CN:
    name: 示例应用
    description: 这是一个简体中文描述
    usage: 简体中文使用说明
  en:
    name: Example App
    description: This is an English description
    usage: English usage guide
  ja:
    name: サンプルアプリ
    description: これは日本語の説明です
    usage: 日本語の使用ガイド

# ========== 二、ApplicationConfig (lzcapp 核心服务) ==========
application:
  # --- 基础配置 ---
  image: alpine:3.21                      # 应用镜像 (留空使用系统默认 alpine3.21)
  background_task: true                   # 自动启动且不休眠 (默认 true)
  subdomain: myapp                        # 入站子域名 (应用默认打开域名)
  secondary_domains:                      # 多域名支持 (v1.3.6+)
    - admin                               # 额外的域名前缀
    - api
  multi_instance: false                   # 多实例部署模式
  usb_accel: false                        # 挂载 /dev/bus/usb 到所有容器
  gpu_accel: false                        # 挂载 /dev/dri 到所有容器
  kvm_accel: false                        # 挂载 /dev/kvm 和 /dev/vhost-net
  depends_on:                             # 依赖的其他容器 (强制 healthy 检测)
    - database
    - redis

  # --- 功能配置 ---
  workdir: /app                           # app 容器工作目录

  # 文件处理配置 (应用关联)
  file_handler:
    mime:                                 # 支持的 MIME 类型列表
      - image/png                         # 具体 MIME 类型
      - image/jpeg
      - video/mp4
      - text/*                            # 通配符: 所有 text 类型 (v1.3.8+)
      - "*/*"                             # 所有文件 (需引号, v1.3.8+)
      - x-lzc-extension/md                # 按扩展名: .md 文件 (v1.3.8+)
    actions:                              # 动作映射
      open: /open?file=%u                 # 打开文件 (%u 会被替换为文件路径)
      edit: /edit?file=%u                 # 编辑文件
      new: /new?file=%u                   # 新建文件

  # 简化版 HTTP 路由规则
  routes:
    - /=http://127.0.0.1:8080             # 根路径转发到 HTTP 服务
    - /api=http://127.0.0.1:3000          # API 路径转发
    - /host-api=http://host.lzcapp:8080   # 访问宿主机服务 (host.lzcapp 特殊域名)
    - /static=file:///lzcapp/pkg/content/web  # 静态文件服务
    - /backend=exec://3000,/app/start.sh  # 执行脚本并转发到指定端口

  # 高级版 HTTP 路由规则 (与 routes 共存, v1.3.8+ 支持基于域名转发)
  upstreams:
    - location: /admin
      disable_trim_location: false        # 转发时不去掉 location 前缀 (v1.3.9+)
      domain_prefix: admin                # 入口匹配的域名前缀
      backend: http://127.0.0.1:8080/admin
      use_backend_host: false             # 使用 backend 的 host header
      backend_launch_command: /app/start-admin.sh  # 自动启动程序
      trim_url_suffix: .html              # 删除 URL 指定后缀
      disable_backend_ssl_verify: false   # 不进行 SSL 验证
      disable_auto_health_chekcing: false # 禁止自动健康检测
      disable_url_raw_path: false         # 删除 raw URL header
      remove_this_request_headers:        # 删除指定 request header
        - Origin
        - Referer
      fix_websocket_header: true          # 修正 Sec-Websocket-xxx 大小写
      dump_http_headers_when_5xx: false   # 5xx 错误时 dump 请求
      dump_http_headers_when_paths:       # 指定路径 dump 请求
        - /debug

    - location: /static
      backend: file:///app/public         # 静态文件服务

  # 独立鉴权的 HTTP 路径列表
  # 注意: 浏览器插件访问应用需要配置 public_path (插件 context 无法使用登录 cookie)
  public_path:
    - /api/public                         # 无需登录即可访问
    - /api/webhook
    - /api/trpc/                          # 浏览器插件访问路径示例
    - /health

  # TCP/UDP 服务配置
  ingress:
    - protocol: tcp                       # 协议类型 (tcp/udp)
      port: 22                            # 目标端口号 (留空则使用入站端口)
      service: app                        # 服务容器名称 (留空则为 app)
      description: SSH 服务               # 服务描述
      publish_port: "2222"                # 入站端口号 (支持 "1000-50000" 范围)
      send_port_info: false               # 发送 uint16 端口信息 (little endian)
      yes_i_want_80_443: false            # 允许 80/443 流量 (绕过系统鉴权,慎用!)

    - protocol: udp
      port: 53
      service: dns
      description: DNS 服务
      publish_port: "5353"

  # app 容器环境变量
  environment:
    - NODE_ENV=production
    - API_KEY=xxx
    - DEBUG=false
    # 系统自动注入的环境变量:
    # - LAZYCAT_APP_DOMAIN: 实际分配的应用域名

  # 健康检测 (开发阶段可设 disable)
  health_check:
    test_url: http://127.0.0.1:8080/health  # HTTP URL 检测 (application 专用)
    start_period: 30s                       # 启动等待时间
    disable: false                          # 禁用健康检测

  # 处理程序配置
  handlers:
    acl_handler: /api/acl                   # ACL 处理程序
    error_page_templates:                   # 错误页面模板 (可选)
      "404": /error/404.html
      "500": /error/500.html
      "502": /error/502.html.tpl          # 支持模板变量 (.StatusCode, .ErrorDetail)

  # OIDC 配置 (v1.3.5+)
  oidc_redirect_path: /auth/oidc.callback   # OIDC 回调地址
  # 设置后会自动注入 OIDC 相关环境变量:
  # - LAZYCAT_AUTH_OIDC_CLIENT_ID
  # - LAZYCAT_AUTH_OIDC_CLIENT_SECRET
  # - LAZYCAT_AUTH_OIDC_ISSUER_URI
  # - LAZYCAT_AUTH_OIDC_AUTH_URI
  # - LAZYCAT_AUTH_OIDC_TOKEN_URI
  # - LAZYCAT_AUTH_OIDC_USERINFO_URI

# ========== 三、ServiceConfig (Docker 容器服务) ==========
services:
  # 数据库服务示例
  database:
    # --- 容器基础配置 ---
    image: postgres:16-alpine             # Docker 镜像
    environment:                          # 环境变量
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=myapp
    entrypoint: /custom-entrypoint.sh     # 容器入口点 (可选)
    command: postgres -c max_connections=200  # 容器命令 (可选)
    tmpfs:                                # 挂载 tmpfs volume (可选)
      - /tmp
      - /run
    depends_on:                           # 依赖服务 (强制 healthy,不含 app)
      - redis
    user: postgres                        # 运行 UID 或 username (可选)

    # --- 资源配置 ---
    cpu_shares: 1024                      # CPU 份额
    cpus: 2.0                             # CPU 核心数
    mem_limit: 2G                         # 内存上限 (支持 string 或 int)
    shm_size: 256M                        # /dev/shm/ 大小

    # --- 网络与权限配置 ---
    network_mode: ""                      # 网络模式 (仅支持 host 或留空)
    netadmin: false                       # NET_ADMIN 权限 (慎用,勿扰乱 iptables)

    # --- 高级配置 ---
    setup_script: |                       # 配置脚本 (root 权限,与 entrypoint/command 冲突)
      #!/bin/sh
      # 注意: 每次容器启动都会执行,不要重复有副作用的操作
      # binds 在容器 created 时已完成,此时 setup_script 还未执行
      # 原始 entrypoint/command 在 setup_script 之后执行
      apk add --no-cache curl
      if [ -z "$(find /conf -mindepth 1 -maxdepth 1)" ]; then
        cp -r /lzcapp/pkg/content/defaults/ /conf/
      fi
    binds:                                # 永久保留目录绑定 (需绑定到 /lzcapp/var 或 /lzcapp/cache)
      - /lzcapp/var/postgres:/var/lib/postgresql/data
    runtime: runc                         # OCI runtime (runc/sysbox-runc)

    # --- 健康检测 (services 专用) ---
    health_check:
      test:                               # 检测命令
        - CMD
        - pg_isready
        - -U
        - postgres
      start_period: 40s                   # 启动等待时间
      disable: false                      # 禁用健康检测

  # Redis 服务示例
  redis:
    image: redis:7-alpine
    environment:
      - REDIS_PASSWORD=secret
    health_check:
      test:
        - CMD
        - redis-cli
        - ping
      start_period: 10s

  # 使用 sysbox-runc 运行 Docker-in-Docker 示例
  docker-runner:
    image: docker:dind
    runtime: sysbox-runc                  # sysbox-runc 支持 dockerd/systemd
    environment:
      - DOCKER_TLS_CERTDIR=/certs
    binds:
      - /lzcapp/var/docker:/var/lib/docker
    # 注意: sysbox-runc 不支持 network_mode=host

  # host 网络模式示例 (需注意安全)
  host-network-service:
    image: nginx:alpine
    network_mode: host                    # 使用宿主网络
    # 注意: 此模式下务必注意鉴权,非必要不要监听 0.0.0.0

  # 需要网络管理权限的服务示例
  vpn-service:
    image: vpn-image:latest
    netadmin: true                        # 具备 NET_ADMIN 权限
    # 注意: 小心不要扰乱 iptables 规则

  # APP Proxy 高级路由示例 (官方维护的 Openresty 镜像)
  app-proxy:
    image: registry.lazycat.cloud/app-proxy:v0.1.0
    environment:
      - UPSTREAM=http://backend:80        # 代理的上游服务
      - BASIC_AUTH_HEADER=Basic dXNlcjpwYXNzd29yZA==  # 绕过 Basic Auth
      - REMOVE_REQUEST_HEADERS=Origin;Host;  # 删除请求头 (多个用;分隔)
    # 或使用 setup_script 自定义 Nginx 配置:
    # setup_script: |
    #   cat <<'EOF' > /etc/nginx/conf.d/default.conf
    #   server {
    #     server_name _;
    #     location / {
    #       proxy_pass http://backend:80;
    #     }
    #   }
    #   EOF

# ========== 四、重要挂载点说明 ==========
# /lzcapp/var              # 应用永久存储目录 (卸载时可选清理)
# /lzcapp/cache            # 应用缓存目录 (用户可手动清理)
# /lzcapp/run/mnt/home     # 用户 document 目录 (需 enable_document_access)
# /lzcapp/pkg/content      # 应用静态资源目录 (只读)
#                          # lzc-build.yml 的 contentdir 目录内容会直接解压到此处
#                          # 例如: contentdir: ./content
#                          #   content/config/ → /lzcapp/pkg/content/config/
#                          #   content/src/    → /lzcapp/pkg/content/src/
#                          # 注意: 不会创建 /lzcapp/pkg/content/content 子目录

# ========== 五、系统自动注入的环境变量 ==========

# 运行时环境变量 (所有容器自动注入)
# LAZYCAT_APP_DEPLOY_UID   # 多实例应用下的用户 ID (单实例为空)
# LAZYCAT_APP_DOMAIN       # 实际分配的应用域名 (可能与 subdomain 不同)
# LAZYCAT_APP_ID           # 应用的 package ID
# LAZYCAT_APP_SERVICE_NAME # 当前容器的 service 名称
# LAZYCAT_BOX_DOMAIN       # 微服的主域名
# LAZYCAT_BOX_NAME         # 微服名称

# 部署时环境变量 (manifest.yml 中可用 ${VAR} 引用)
# LAZYCAT_APP_DEPLOY_UID   # 多实例应用下的用户 ID
# LAZYCAT_APP_DEPLOY_ID    # 实例自身的 ID (v1.3.8+)
# LAZYCAT_APP_DOMAIN       # 应用分配的域名
# LAZYCAT_APP_ID           # 应用的 package ID
# LAZYCAT_BOX_DOMAIN       # 微服的主域名
# LAZYCAT_BOX_NAME         # 微服名称

# OIDC 相关环境变量 (仅当设置 oidc_redirect_path 时注入)
# LAZYCAT_AUTH_OIDC_CLIENT_ID      # OAuth client ID
# LAZYCAT_AUTH_OIDC_CLIENT_SECRET  # OAuth client secret (每次重启变动)
# LAZYCAT_AUTH_OIDC_ISSUER_URI     # OIDC issuer 地址
# LAZYCAT_AUTH_OIDC_AUTH_URI       # 授权端点地址
# LAZYCAT_AUTH_OIDC_TOKEN_URI      # Token 端点地址
# LAZYCAT_AUTH_OIDC_USERINFO_URI   # 用户信息端点地址

# ========== 六、manifest.yml 模板渲染 (v1.3.8+) ==========
# 支持 Go text/template 语法渲染 manifest.yml
# 可用模板参数:
# - .UserParams (.U)          # lzc-deploy-params.yml 中定义的用户参数
# - .SysParams (.S)            # 系统参数
#   - .BoxName                 # 微服名称
#   - .BoxDomain               # 微服域名
#   - .OSVersion               # 系统版本号
#   - .AppDomain               # 应用域名
#   - .IsMultiInstance         # 是否多实例
#   - .DeployUID               # 部署用户 ID (多实例时)
#   - .DeployID                # 实例唯一 ID
#
# 内置模板函数:
# - stable_secret "seed"      # 生成稳定的密码 (相同种子+应用+微服=相同结果)
# - sprig 函数库              # https://masterminds.github.io/sprig/
#
# 示例:
# services:
#   mysql:
#     environment:
#       - MYSQL_ROOT_PASSWORD={{ stable_secret "root_password" }}
#       - MYSQL_USER={{ .U.Username }}
#       - IS_ADMIN={{ if eq .S.DeployUID "admin" }}true{{ else }}false{{ end }}

# ========== 七、内部域名解析规则 ==========

# 应用内 Service 域名规则:
# 1. 单实例应用: ${service_name}.${appid}.lzcapp
#    示例: database.cloud.lazycat.app.myapp.lzcapp
#
# 2. 多实例应用: ${userId}.${service_name}.${appid}.lzcapp
#    示例: admin.database.cloud.lazycat.app.myapp.lzcapp
#
# 3. 简写形式: ${service_name} (推荐,v1.3.0+ 应用隔离后更安全)
#    示例: database (在应用内部可直接使用 service 名称)
#    注意: 完整域名形式主要用于需要保留 HTTP Host Header 的场景

# 特殊域名:
# - host.lzcapp       # 解析到 lzc-docker 网桥 (用于 host 网络模式的服务)
# - _outbound         # 解析到微服的默认出口 IP
# - _gateway          # 解析到微服所在网络的网关

# 应用间网络隔离 (v1.3.0+):
# - 应用间禁止直接网络通讯
# - 跨应用访问需通过端口转发工具转发到"微服虚拟网卡"

# ========== 八、外部域名规则说明 ==========
# 1. subdomain 仅为期望值,实际域名可能被添加小尾巴
# 2. 多实例应用每个用户会分配独立域名
# 3. 支持域名前缀: xxxx-subdomain 与 subdomain 效果相同
# 4. v1.3.6+ 支持 secondary_domains 配置多个域名
# 5. v1.3.8+ upstreams 支持 domain_prefix 实现基于域名的路由
# 6. 实际分配的域名通过环境变量 LAZYCAT_APP_DOMAIN 获取
```

## build.yml 完整字段参考模板

> 此模板包含所有可用字段及详细注释,实际使用时按需选择。
> 详细的字段规范说明请查看:[docs/spec/build.md](docs/spec/build.md)

```yaml
# ========== 一、BuildConfig 构建配置 ==========

# 构建脚本 (必填)
# - 可以为构建脚本的路径地址
# - 如果构建命令简单,也可以直接写 sh 的命令
buildscript: sh build.sh

# manifest.yml 文件路径 (必填)
manifest: ./lzc-manifest.yml

# 打包内容目录 (必填)
# 此目录的内容会被打包到 lpk 中,对应 /lzcapp/pkg/content
contentdir: ./dist

# lpk 包的输出路径 (必填)
pkgout: ./

# 应用图标路径 (必填)
# 仅允许 png 后缀的文件
# 建议宽高比 1:1,宽高大于等于 512x512 像素
icon: ./lzc-icon.png

# ========== 二、DevshellConfig 开发依赖配置 ==========
devshell:
  # 开发路由规则 (与 manifest.yml 的 routes 格式相同)
  routes:
    - /=http://127.0.0.1:5173        # 开发服务器路由
    - /api=http://127.0.0.1:3000     # API 路由

  # 自动安装依赖 (Alpine apk 包名)
  # 如果 dependencies 和 build 同时存在,优先使用 dependencies
  dependencies:
    - nodejs
    - npm
    - python3
    - py3-pip
    - git
    - curl

  # 手动安装脚本 (用于复杂的安装逻辑)
  setupscript: |
    export npm_config_registry=https://registry.npmmirror.com
    export PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
    npm install -g pnpm

  # 使用指定基础镜像 (可选)
  image: node:18-alpine

  # 镜像拉取策略 (可选)
  # - 留空: 直接使用 image 指定的镜像
  # - build: 使用 Dockerfile 构建镜像
  pull_policy: build

  # Dockerfile 路径 (当 pull_policy=build 时使用)
  build: ./dev.dockerfile

# ========== 三、ComposeOverrideConfig 高级配置 ==========
# 需要 lzc-cli >= 1.2.61 和 lzc-os >= v1.3.0
# 用于无法通过 manifest.yml 表达的特殊权限需求
compose_override:
  services:
    # 指定服务名称 (必须是 manifest.yml 中定义的服务)
    app:
      # 删除的 Linux capabilities
      cap_drop:
        - SETCAP
        - MKNOD

      # 额外挂载的文件或目录
      volumes:
        - /data/playground:/lzcapp/run/playground:ro

    database:
      cap_drop:
        - NET_RAW

# ========== 四、模板变量支持 ==========
# 整个文件中可以通过 ${var} 的方式使用 manifest.yml 中定义的值
# 例如:
# image: registry.lazycat.cloud/${package}:${version}
```

## 配置文件详细说明

### 详细字段规范
- **lzc-manifest.yml**: 完整字段说明请查看 [docs/spec/manifest.md](docs/spec/manifest.md)
- **lzc-build.yml**: 完整字段说明请查看 [docs/spec/build.md](docs/spec/build.md)
- **lzc-deploy-params.yml**: 部署参数配置 (可选,v1.3.8+),请查看 [docs/spec/deploy-params.md](docs/spec/deploy-params.md)
  - 用于定义应用安装时需要用户填写的参数
  - 参数通过 `.U` 或 `.UserParams` 在 manifest.yml 模板中引用
  - 多实例应用下每个用户的部署参数独立
  - 如果所有参数都是可选的,会跳过部署界面

## 快速检索

### 按功能检索

#### 我想创建第一个应用
1. 阅读: `docs/hello-world.md`
2. 环境搭建: `docs/lzc-cli.md`
3. Python 示例: `docs/app-example-python.md`

#### 我想配置应用路由
1. 简单路由: `docs/advanced-route.md` + `spec/manifest.md` (routes)
2. 高级路由: `docs/advanced-routes.md` + `spec/manifest.md` (upstreams)
3. 多域名: `docs/advanced-secondary-domains.md`

#### 我想访问用户文件
1. 阅读: `docs/advanced-file.md`
2. 配置: `spec/manifest.md` (ext_config.enable_document_access)

#### 我想使用 GPU
1. 阅读: `docs/advanced-gpu.md`
2. 配置: `spec/manifest.md` (gpu_accel: true)

#### 我想发布应用
1. 准备: `docs/store-submission-guide.md`
2. 流程: `docs/publish-app.md`

#### 我想了解网络机制
1. 基础: `docs/network.md`
2. 高级配置: `docs/network-config.md`
3. 问题诊断: `docs/network-diagnostic/`

### 按关键字检索

| 关键字 | 相关文件 |
|--------|----------|
| **lzc-manifest.yml** | `spec/manifest.md` |
| **lzc-build.yml** | `spec/build.md` |
| **routes** | `advanced-route.md`, `spec/manifest.md` |
| **upstreams** | `advanced-routes.md`, `spec/manifest.md` |
| **depends_on** | `advanced-depends.md`, `spec/manifest.md` |
| **gpu** | `advanced-gpu.md`, `spec/manifest.md` |
| **devshell** | `devshell-local.md`, `devshell-install-and-use.md`, `spec/build.md` |
| **network** | `network.md`, `network-config.md`, `network-diagnostic/` |
| **docker** | `deploy/Dockerfile`, `DEPLOYMENT.md` |
| **nginx** | `deploy/nginx.conf` |
| **vitepress** | `docs/.vitepress/config.mts`, `package.json` |
