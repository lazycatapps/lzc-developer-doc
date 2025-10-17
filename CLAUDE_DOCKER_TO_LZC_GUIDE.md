# Docker Compose 转 LZC Manifest 转换指南

## 一、核心概念对照表

| Docker Compose | LZC Manifest | 说明 |
|----------------|--------------|------|
| `services` | `services` + `application` | DC的services分为主服务(app)和辅助服务 |
| `image` | `image` | 镜像名称,可能需要推送到私有仓库 |
| `build` | 需构建并推送 | LZC不支持运行时构建,需提前构建推送 |
| `ports` | `routes` + `ingress` | HTTP/HTTPS用routes,TCP/UDP用ingress |
| `volumes` | `binds` | 需映射到`/lzcapp/var`或`/lzcapp/cache` |
| `environment` | `environment` | 环境变量数组格式相同 |
| `command` | `command` | 命令字符串 |
| `entrypoint` | `entrypoint` | 入口点字符串 |
| `depends_on` | `depends_on` | 依赖关系,强制healthy检测 |
| `healthcheck` | `health_check` | 健康检查配置 |
| `networks` | 不支持 | 使用服务DNS:`<service>.<package>.lzcapp` |

## 二、顶层配置映射

### 2.1 基础信息(必填)

```yaml
# LZC Manifest 必需字段
lzc-sdk-version: 0.1              # 固定值
package: com.example.myapp        # 全球唯一ID,建议用域名
version: 1.0.0                    # 语义化版本号
name: 我的应用                     # 应用名称
description: 应用描述              # 应用描述
author: 作者名称                   # 作者
```

### 2.2 可选配置

```yaml
homepage: https://example.com           # 主页
license: MIT                            # 许可证
min_os_version: ">=1.0.18"             # 最低系统版本
unsupported_platforms:                  # 不支持的平台
  - ios
  - android
```

## 三、服务转换规则

### 3.1 主服务(application)

Docker Compose 中的**主要服务**需要转换为 `application` 配置块:

```yaml
# Docker Compose
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"

# 转换为 LZC Manifest
application:
  subdomain: web                    # 应用访问子域名
  background_task: true             # 开机自启
  multi_instance: false             # 单实例模式
  routes:
    - /=http://app:80              # app是特殊服务名,指向主容器

services:
  app:                              # 主服务必须命名为app
    image: nginx:alpine
```

### 3.2 辅助服务(services)

其他服务保持在 `services` 中:

```yaml
# Docker Compose
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret

# 转换为 LZC Manifest
services:
  db:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=secret
```

## 四、镜像处理策略

### 4.1 公共镜像

**选项1**: 直接使用(推荐)
```yaml
image: nginx:alpine
```

**选项2**: 推送到懒猫官方镜像源
```bash
lzc-cli appstore copy-image nginx:alpine
# 输出: uploaded: registry.lazycat.cloud/nginx:xxx
```

**选项3**: 推送到私有仓库
```bash
docker pull nginx:alpine
docker tag nginx:alpine myregistry.com/nginx:alpine
docker push myregistry.com/nginx:alpine
```

### 4.2 自定义构建镜像

**必须提前构建并推送**:

```yaml
# Docker Compose
services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile

# 转换步骤:
# 1. 构建镜像
docker build -t myapp:latest ./app

# 2. 推送到仓库(选择一种)
# 方式A: 推送到懒猫官方源
lzc-cli appstore copy-image myapp:latest

# 方式B: 推送到私有仓库
docker tag myapp:latest myregistry.com/myapp:hash123
docker push myregistry.com/myapp:hash123

# 3. 在manifest中使用推送后的镜像
services:
  app:
    image: registry.lazycat.cloud/myapp:xxx
    # 或
    image: myregistry.com/myapp:hash123
```

## 五、端口与路由转换

### 5.1 HTTP/HTTPS 路由

```yaml
# Docker Compose
services:
  web:
    ports:
      - "8080:80"

# 转换为 LZC (简化版)
application:
  routes:
    - /=http://web.com.example.myapp.lzcapp:80

# 转换为 LZC (高级版)
application:
  upstreams:
    - location: /
      backend: http://web.com.example.myapp.lzcapp:80
      # 可选配置
      disable_trim_location: false
      use_backend_host: false
      fix_websocket_header: true
```

### 5.2 TCP/UDP 端口

```yaml
# Docker Compose
services:
  ssh:
    ports:
      - "2222:22"

# 转换为 LZC
application:
  ingress:
    - protocol: tcp
      port: 22                    # 容器内端口
      service: ssh                # 服务名称
      publish_port: "2222"        # 对外端口
      description: SSH服务
```

### 5.3 静态文件服务

```yaml
# LZC Manifest
application:
  routes:
    - /static=file:///lzcapp/pkg/content/public
```

## 六、卷挂载转换

### 6.1 卷类型映射

| Docker Compose卷类型 | LZC处理方式 |
|---------------------|------------|
| 绑定挂载(Bind Mount) | 映射到`/lzcapp/pkg/content/*` |
| 命名卷(Named Volume) | 映射到`/lzcapp/var/*` |
| 匿名卷(Anonymous) | 映射到`/lzcapp/var/*` |

### 6.2 转换规则

```yaml
# Docker Compose
services:
  app:
    volumes:
      - ./data:/app/data           # 绑定挂载
      - dbdata:/var/lib/mysql      # 命名卷
      - /tmp                        # 匿名卷

volumes:
  dbdata:

# 转换为 LZC
services:
  app:
    binds:
      # 绑定挂载: 内容已打包到content.tar
      - /lzcapp/pkg/content/data:/app/data

      # 命名卷/匿名卷: 映射到持久化目录
      - /lzcapp/var/mysql:/var/lib/mysql
      - /lzcapp/var/tmp:/tmp
```

### 6.3 特殊目录访问

需要访问用户文稿或媒体文件:

```yaml
ext_config:
  enable_document_access: true    # 挂载到 /lzcapp/run/mnt/home
  enable_media_access: true       # 挂载到 /lzcapp/run/mnt/media

services:
  app:
    binds:
      - /lzcapp/run/mnt/home/mydata:/app/userdata
```

## 七、环境变量处理

### 7.1 基本转换

```yaml
# Docker Compose
services:
  app:
    environment:
      - NODE_ENV=production
      - API_KEY=secret123
      # 或对象格式
      NODE_ENV: production
      API_KEY: secret123

# 转换为 LZC (统一为数组格式)
services:
  app:
    environment:
      - NODE_ENV=production
      - API_KEY=secret123
```

### 7.2 环境变量文件

```yaml
# Docker Compose
services:
  app:
    env_file:
      - .env
      - .env.local

# 转换为 LZC
# 需要手动合并.env文件内容到environment数组
services:
  app:
    environment:
      - VAR1=value1
      - VAR2=value2
```

### 7.3 变量替换

Docker Compose的`${VAR:-default}`需要在转换前解析:

```bash
# 转换前先加载环境变量
source .env
# 然后进行转换,docker2lzc工具会自动处理
```

## 八、健康检查转换

```yaml
# Docker Compose
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      start_period: 30s
      interval: 10s
      timeout: 5s
      retries: 3

# 转换为 LZC (application)
application:
  health_check:
    test_url: http://127.0.0.1/health
    start_period: 30s
    # interval/timeout/retries 由系统管理

# 转换为 LZC (services)
services:
  db:
    health_check:
      test:
        - CMD
        - pg_isready
        - -U
        - postgres
      start_period: 40s
```

## 九、依赖关系转换

```yaml
# Docker Compose
services:
  web:
    depends_on:
      - db
      - redis
  db:
    image: postgres
  redis:
    image: redis

# 转换为 LZC
application:
  depends_on:
    - db
    - redis

services:
  db:
    image: postgres
    health_check:
      test: ["CMD", "pg_isready"]
  redis:
    image: redis
    health_check:
      test: ["CMD", "redis-cli", "ping"]
```

**注意**: LZC的依赖强制要求healthy检查,所以被依赖的服务必须配置health_check。

## 十、网络与服务发现

### 10.1 服务DNS

Docker Compose的网络被LZC的服务DNS取代:

```yaml
# Docker Compose
services:
  web:
    links:
      - db
  db:
    image: postgres

# 在web容器中访问: http://db:5432

# 转换为 LZC
services:
  web:
    image: nginx
  db:
    image: postgres

# 在web容器中访问: http://db.com.example.myapp.lzcapp:5432
# 格式: <service>.<package>.lzcapp
```

### 10.2 Host网络模式

```yaml
# Docker Compose
services:
  app:
    network_mode: host

# 转换为 LZC
services:
  app:
    network_mode: host
    # 注意: 使用host模式需要注意安全,不要监听0.0.0.0
```

## 十一、资源限制转换

```yaml
# Docker Compose
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

# 转换为 LZC
services:
  app:
    cpus: 2.0
    mem_limit: 2G
    cpu_shares: 1024
    shm_size: 256M
```

## 十二、完整转换示例

### 12.1 Docker Compose 原始文件

```yaml
version: '3.8'

services:
  web:
    build: ./web
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    volumes:
      - ./public:/app/public

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: mydb
    volumes:
      - dbdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      start_period: 30s

volumes:
  dbdata:
```

### 12.2 转换后的 LZC Manifest

```yaml
lzc-sdk-version: 0.1
package: com.example.webapp
version: 1.0.0
name: 我的Web应用
description: 基于Docker Compose转换的示例应用
author: 开发者

application:
  subdomain: webapp
  background_task: true
  multi_instance: false
  routes:
    - /=http://app:80
  depends_on:
    - db

services:
  app:
    image: myregistry.com/webapp:latest
    environment:
      - NODE_ENV=production
    binds:
      - /lzcapp/pkg/content/public:/app/public

  db:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=mydb
    binds:
      - /lzcapp/var/postgres:/var/lib/postgresql/data
    health_check:
      test:
        - CMD
        - pg_isready
        - -U
        - postgres
      start_period: 30s
```

## 十三、转换注意事项

### 13.1 必须处理的差异

1. **主服务命名**: 必须有一个服务命名为`app`或在application中配置
2. **镜像构建**: 必须提前构建并推送,不支持运行时构建
3. **卷映射**: 所有持久化目录必须映射到`/lzcapp/var`或`/lzcapp/cache`
4. **网络**: 使用服务DNS `<service>.<package>.lzcapp` 代替links
5. **健康检查**: 依赖服务必须配置health_check

### 13.2 不支持的功能

- `networks` 自定义网络(使用服务DNS)
- `extends` 配置继承(需手动展开)
- `profiles` 配置文件(需拆分为多个manifest)
- `secrets` 密钥管理(使用environment变量)
- `configs` 配置管理(打包到content.tar)
- 运行时`build`(必须提前构建)

### 13.3 最佳实践

1. **使用docker2lzc工具**: 自动化大部分转换过程
2. **镜像推送策略**:
   - 公共镜像可直接使用
   - 私有镜像优先推送到懒猫官方源
   - 企业应用使用私有镜像仓库
3. **卷挂载规划**:
   - 应用数据 → `/lzcapp/var`
   - 缓存数据 → `/lzcapp/cache`
   - 用户数据 → `/lzcapp/run/mnt/home`(需开启权限)
4. **环境变量管理**:
   - 敏感信息在打包前设置
   - 使用.env文件统一管理
5. **依赖关系**:
   - 确保被依赖服务配置健康检查
   - 合理设置start_period避免启动失败

## 十四、使用docker2lzc工具转换

### 14.1 工具安装

```bash
npm install -g docker2lzc
```

### 14.2 交互式转换

```bash
# 在docker-compose.yml所在目录执行
docker2lzc

# 工具会引导你完成:
# 1. 选择docker-compose.yml文件
# 2. 选择应用图标
# 3. 填写应用基本信息
# 4. 配置路由规则
# 5. 处理卷挂载
# 6. 处理镜像推送
# 7. 生成lpk安装包
```

### 14.3 命令行转换

```bash
docker2lzc \
  --name "我的应用" \
  --package "com.example.myapp" \
  --version "1.0.0" \
  --description "应用描述" \
  --author "作者" \
  --subdomain "myapp" \
  --icon "./icon.png" \
  --compose "./docker-compose.yml" \
  --background-task true \
  --multi-instance false \
  --non-interactive
```

### 14.4 工具核心功能

1. **环境变量处理**: 自动解析.env文件和`${VAR:-default}`语法
2. **镜像管理**:
   - 检测build配置并提示构建
   - 支持推送到懒猫官方源或私有仓库
   - 缓存镜像推送结果
3. **卷挂载智能处理**:
   - 自动识别绑定挂载/命名卷/匿名卷
   - 引导选择映射到/lzcapp/var或用户目录
   - 处理相对路径和绝对路径
4. **路由配置**:
   - 自动从ports读取端口映射
   - 支持HTTP/HTTPS/TCP/UDP配置
   - 支持静态文件服务
5. **依赖处理**: 自动转换depends_on并验证健康检查

## 十五、转换后验证

### 15.1 检查清单

- [ ] 所有服务的镜像已推送到可访问的仓库
- [ ] 主服务正确配置在application或命名为app
- [ ] 路由规则覆盖所有需要的访问路径
- [ ] 卷挂载路径符合LZC规范
- [ ] 依赖服务配置了健康检查
- [ ] 环境变量正确设置(无敏感信息泄露)
- [ ] 必填字段完整(package/version/name等)

### 15.2 测试部署

```bash
# 1. 安装lpk包到懒猫微服
lzc-cli app install com.example.myapp.lpk

# 2. 查看应用状态
lzc-cli app status com.example.myapp

# 3. 查看日志排查问题
lzc-cli app logs com.example.myapp
lzc-cli app logs com.example.myapp --service db

# 4. 访问应用
# 浏览器打开: https://webapp.<你的域名>
```

## 十六、常见问题

### Q1: 如何处理多个docker-compose文件?

**A**: 先手动合并为一个文件,或分别转换为多个LZC应用。

### Q2: 如何处理docker-compose.override.yml?

**A**: 使用`docker-compose config`命令合并后再转换:
```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml config > merged.yml
docker2lzc --compose merged.yml
```

### Q3: 构建镜像时有多阶段构建怎么办?

**A**: 多阶段构建正常进行,转换工具只关心最终镜像:
```bash
docker build -t myapp:latest .
lzc-cli appstore copy-image myapp:latest
```

### Q4: 如何处理需要特权模式的容器?

**A**: LZC不支持完全特权模式,但支持特定权限:
```yaml
services:
  app:
    netadmin: true        # NET_ADMIN权限
    runtime: sysbox-runc  # 更高隔离,支持dockerd
```

### Q5: 服务间通信地址太长怎么办?

**A**: 在容器内配置环境变量或hosts:
```yaml
services:
  app:
    environment:
      - DB_HOST=db.com.example.myapp.lzcapp
```

## 十七、参考资源

- [LZC Manifest 规范文档](./docs/spec/manifest.md)
- [LZC Build 规范文档](./docs/spec/build.md)
- [docker2lzc 工具源码](https://github.com/lazycat-cloud/docker2lzc)
- [Docker Compose 官方文档](https://docs.docker.com/compose/)
