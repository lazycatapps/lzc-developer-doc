# lzc-manifest.yml 规范文档

## 一、 概述
`lzc-manifest.yml` 是用于定义应用部署相关配置的文件。 本文档将详细描述其结构和各字段的含义。

## 二、 顶层数据结构 `ManifestConfig`

### 2.1 基本信息 {#basic-config}

| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `package` | `string` | 应用的唯一 id， 需保持全球唯一， 建议以个人域名开头 |
| `version` | `string` | 应用的版本号 |
| `name` | `string` | 应用名称 |
| `description` | `string` | 应用描述 |
| `usage` | `string` | 应用的使用须知， 如果不为空， 则微服内每个用户第一次访问本应用时会自动渲染 |
| `license` | `string` | 应用的 License 说明 |
| `homepage` | `string` | 应用的主页 |
| `author` | `string` | 作者名称， 若通过商店渠道则商店账号优先级更高 |
| `min_os_version` | `string` | 本应用要求的最低系统版本， 若不满足则应用安装时会失败， 且应用商店会拒绝安装此应用 |

### 2.2 其他配置
| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `ext_config` | `ExtConfig` | 实验性属性， 暂不对外公开 |
| `unsupported_platforms` | `[]string` | 应用不支持的平台， 有效字段为: "iOS", "android", "windows", "macos", "linux", "tvos" |
| `application` | `ApplicationConfig` | lzcapp 核心服务配置 |
| `services` | `map[string]ServiceConfig` | 传统 docker container 相关服务配置 |

## 三、 `IngressConfig` 配置
### 3.1 网络配置
| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `protocol` | `string` | 协议类型， 支持 `TCP` 或 `UDP` |
| `port` | `int` | 目标端口号， 若为空， 则使用实际入站的端口 |
| `service` | `string` | 服务容器的名称， 若为空， 则为 `app` 这个特殊 service |
| `description` | `string` | 服务描述， 以便系统组件渲染应用服务给管理员查阅 |
| `publish_port` | `string` | 允许的入站端口号， 可以为具体的端口号或 `1000~50000` 这种端口范围 |
| `send_port_info` | `bool` | 以 little ending 发送 uint16 类型的实际入站端口给目标端口后再进行数据转发 |

## 四、 `ApplicationConfig` 配置
### 4.1 基础配置
| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `image` | `string` | 应用镜像， 若无特殊要求， 请留空使用系统默认镜像(alpine3.21) |
| `background_task` | `bool` | 若为 `true` 则会自动启动并且不会被自动休眠， 默认为 `true` |
| `subdomain` | `string` | 本应用的入站子域名 |
| `multi_instance` | `bool` | 是否以多实例形式部署 |
| `usb_accel` | `bool` | 挂载相关设备到所有服务容器内的 `/dev/bus/usb` |
| `gpu_accel` | `bool` | 挂载相关设备到所有服务容器内的 `/dev/dri` |
| `kvm_accel` | `bool` | 挂载相关设备到所有服务容器内的 `/dev/kvm` 和 `/dev/vhost-net` |

### 4.2 功能配置
| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `file_handler` | `FileHandlerConfig` | 声明本应用支持的扩展名， 以便其他应用在打开特定文件时可以调用本应用 |
| `routes` | `[]string` | http 相关路由规则 |
| `public_path` | `[]string` | 独立鉴权的 http 路径列表 |
| `workdir` | `string` | `app` 容器启动时的工作目录 |
| `ingress` | `[]IngressConfig` | TCP/UDP 服务相关 |
| `environment` | `[]string` | `app` 容器的环境变量 |
| `health_check` | `HealthCheckConfig` | `app` 容器的健康检测， 仅建立在开发调试阶段设置 `Disable` 字段， 不建议进行替换， 否则系统默认注入的自动依赖检测逻辑会丢失 |

## 五、 `HealthCheckConfig` 配置
### 5.1 检测配置
| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `test` | `[]string` | 仅 services 字段下生效。 例如： `["CMD", "curl", "-f", "http://localhost"]` 或 `test: curl -f https://localhost || exit 1` |
| `start_period` | `time.Duration` | 启动等待阶段时间， 超出此时间范围后若还未进入 `healthly` 状态则会变为 `unhealthy` |
| `disable` | `bool` | 禁用本容器的健康检测 |
| `test_url` | `string` | 仅 application 字段下生效。 扩展的检测方式， 直接提供一个 http url 不依赖容器内部有 curl/wget 之类的命令行 |

## 六、 `ExtConfig` 配置
### 6.1 实验性配置
| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `disable_url_raw_path` | `bool` | 禁用 URL 的原始路径 |
| `permissions` | `[]string` | 权限列表 |

## 七、 `ServiceConfig` 配置

### 7.1 容器配置 {#container-config}

| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `image` | `string` | 对应容器的 docker 镜像 |
| `environment` | `[]string` | 对应容器的环境变量 |
| `entrypoint` | `*string` | 对应容器的 entrypoint， 可选 |
| `command` | `*string` | 对应容器的 command， 可选 |
| `tmpfs` | `[]string` | 挂载 tmpfs volume， 可选 |
| `depends_on` | `[]string` | 依赖的其他容器服务， 仅支持本应用内的其他服务， 且强制检测类型为 `healthly`， 可选 |
| `restart` | `*string` | 容器的 restart 策略 |
| `health_check` | `*HealthCheckConfig` | 容器的健康检测策略 |
| `user` | `*string` | 容器运行的 UID 或 username， 可选 |
| `cpu_shares` | `int64` | CPU 份额 |
| `cpus` | `float32` | CPU 核心数 |
| `network_mode` | `string` | 网络模式， 目前只支持`host`或留空。 若为 `host` 则会容器的网络为宿主网络空间。 此模式下应用进行网络监听时务必注意鉴权， 非必要不要监听 `0.0.0.0` |
| `netadmin` | `bool` | 若为 `true`， 则容器具备 `NET_ADMIN` 权限， 可以操作网络相关系统调用， 如无必要请不要使用。 若使用此功能， 请务必小心不要扰乱 iptables 相关规则 |
|`setup_script` | `*string` | 配置脚本， 脚本内容会以 root 权限执行后， 再按照 OCI 的规范执行原始的 entrypoint 内容。 本字段和 entrypoint,command 字段冲突， 无法同时设置， 可选 |
| `binds` | `[]string` | lzcapp 容器的 rootfs 重启后会丢失， 仅 `/lzcapp/var`, `/lzcapp/cache` 路径下的数据会永久保留。 因此其他需要保留的目录需要 bind 到这两个目录之下。 此列表仅支持 `/lzcapp` 开头的路径 |

## 八 `FileHandlerConfig` 配置
### 8.1 文件处理配置
| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `mime` | `[]string` | 支持的 MIME 类型列表 |
| `actions` | `map[string]string` | 动作映射 |

## 九 `HandlersConfig` 配置

### 9.1 处理程序配置
| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `acl_handler` | `string` | ACL 处理程序 |
| `error_page_templates` | `map[string]string` | 错误页面模板， 可选 |

## 十 与 `UserDeployParams` 的关联

`lzc-deploy-params.yml` 中的 `UserDeployParams` 会在应用实例部署前， 由实例所属者补充相关字段，
并将最终内容作为`.U`参数来渲染 `lzc-manifest.yml` 后再进行实际部署。 `UserDeployParams` 包含 `UserParam` 数组， `UserParam` 各字段含义如下：

| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `id` | `string` | 本应用内的唯一 ID， 在最终渲染阶段可以使用 `.U.$id` 的形式引用此参数的实际值 |
| `type` | `string` | 字段类型。 支持 `bool`、 `lzc_uid`、 `string`。 若出现不识别的类型， 则 fallback 为 `string`； `lzc_uid` 类型会根据实例拥有者本身的权限来决定可以选择的用户列表内容 |
| `description` | `string` | 描述此参数的含义， 以便用户能正确填写 |
| `name` | `string` | 字段名称， 避免显示 Id， 名称以作解释 |
| `optional` | `bool` | 此字段是否为必填选项。 当剩余参数均为 `Optional=true` 时， 系统不会主动要求， 用户进入配置界面 |
| `default_value` | `string` | 开发者提供的默认值 |
| `hidden` | `bool` | 若为 `true` 则不渲染此字段， 一般是配合开发者提供的 `DefaultValue` 来实现全局常量的作用 |
