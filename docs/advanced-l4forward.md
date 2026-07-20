# TCP/UDP 4层转发 {#tcp-udp-ingress}

::: warning 正常http流量，请使用`application.routes`功能

ingress的TCP/UDP转发能是为了提供给微服客户端之外使用，比如命令行或第三方应用。
如果只是为了转发容器的某个http端口，请使用lzcapp的[http路由功能](./advanced-route.md)。

:::


如果您想提供一些 TCP/UDP 服务，可以在 `lzc-manifest.yml` 文件中的 `application` 字段下加一个 `ingress` 子字段

```yml
application:
  ingress:
    - protocol: tcp
      port: 8080
    - protocol: tcp
      description: 数据库服务
      port: 3306
      service: mysql
    - protocol: tcp
      description: 2W-3W端口来源转发到对应端口
      service: app
      publish_port: 20000-30000
    - protocol: tcp
      description: 1.6W-1.8W端口来源都转发到6666端口
      service: app
      port: 6666
      publish_port: 16000-18000
```

- `protocol`: 对外服务的协议， 有 `tcp` 和 `udp` 两种选择
- `description`: 对此服务的描述，便于管理员了解基本情况
- `port`: 目标服务的端口号，若不写则为实际入站端口号。（v1.3.8之前的版本不支持`port`为80或443）
- `service`: 服务名称，用来定位具体的`service container`。默认值为`app`
- `publish_port`: 入站端口号，默认值为`port`对应的端口号。支持`3306`以及`1000-50000`两种写法。
- `send_port_info`: 仅 TCP 有效。开启后，系统会在转发给目标服务的 TCP 数据流开头写入 2 字节原始入站端口，格式为 little endian `uint16`。

设置好以后， 就可以通过浏览器来进行访问啦, 比如您的应用域名为 `app-subdomain` (lzc-manifest.yml 文件的 subdomain 字段)， 设备名为 `devicename`, 您就可以通过访问 `app-subdomain.devicename.heiyu.space:3306` 来访问对外提供的 TCP 服务啦。

## 转发规则与动态状态 {#runtime-state}

应用声明 `application.ingress` 后，系统会按应用 `subdomain` 分配一个独立的虚拟外部 IP，并把该子域名解析到这个 IP。应用部署、移除、配置变化或实例部署完成时，系统会重新加载当前应用的 `lzc-manifest.yml`，更新内存中的 L4 转发规则。

有 TCP/UDP 流量进入时，系统会先根据外部域名对应的虚拟外部 IP 找到应用，再按 `protocol` 和原始入站端口匹配 `ingress` 条目。

`service` 为空时使用 `app`。`port` 为空时，目标端口使用实际入站端口；`port` 不为空时，目标端口固定为 `port`。

例如下面这条规则，外部访问 `$appdomain:16000` 时，流量会进入应用 `app` service 容器的 `16000` 端口；外部访问 `$appdomain:16001` 时，流量会进入应用 `app` service 容器的 `16001` 端口：

```yml
application:
  ingress:
    - protocol: tcp
      description: 1.6W-1.8W端口来源转发到对应端口
      service: app
      publish_port: 16000-18000
```

例如下面这条规则，外部访问 `16000-18000` 范围内任意端口时，流量都会进入 `app` 服务的 `6666` 端口：

```yml
application:
  ingress:
    - protocol: tcp
      description: 1.6W-1.8W端口来源都转发到6666端口
      service: app
      port: 6666
      publish_port: 16000-18000
```

这种配置下，应用内监听 `6666` 端口的服务只能看到连接进入了 `6666`。如果应用需要知道用户实际访问的是 `16000`、`16001` 还是其他入站端口，需要显式开启 `send_port_info`：

```yml
application:
  ingress:
    - protocol: tcp
      description: 1.6W-1.8W端口来源都转发到6666端口，并发送原始入站端口
      service: app
      port: 6666
      publish_port: 16000-18000
      send_port_info: true
```

开启后，目标服务接受 TCP 连接后需要先读取 2 字节，并按 little endian `uint16` 解析为原始入站端口，然后再继续读取后续业务数据。这个端口信息是系统额外写入的数据，业务协议需要预留这 2 字节；如果直接转发现有协议，开启前应确认协议端可以处理这个前缀。

Go 服务端示例：

```go
var port uint16
if err := binary.Read(conn, binary.LittleEndian, &port); err != nil {
    // 处理错误
}
```

::: warning 安全提示
当您使用TCP/UDP功能时，微服系统仅能提供底层虚拟网络的保护，从原理上无法提供鉴权流程。
微服客户端上的其他进程可以不受限制的访问对应TCP/UDP端口。
若用户使用端口转发工具进行转发则会进一步降低安全性，因此开发者在提供TCP/UDP功能时一定要妥善处理鉴权逻辑。
:::

::: warning 80/443

当您的应用直接接管443时(v1.3.8+支持)，流量是直接到达您容器内，因此系统无法做一些预处理，包括但不限于

- 账户鉴权
- 自动唤醒应用
- HTTPS证书配置
- application.routes,application.upstreams等配置

几乎所有情况下您都不应该去使用443端口配置。

目前设想唯一合理的场景是：使用微服分配的EIP，全流量转发到另外一台主机/NAS上，并配置一个非微服域名。

如果您真的确定要自行处理80/443流量则需要在对应ingress条目里明确声明`yes_i_want_80_443:true`

:::
