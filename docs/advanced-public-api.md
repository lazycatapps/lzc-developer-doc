# 独立鉴权

## HTTP 服务

当您用浏览器访问微服应用时， 为了您的安全必须输入用户名密码才能访问。

但是在一些安全要求不高的场景， 比如公共文件下载服务， 输入用户名密码太繁琐， 您只需要在 `lzc-manifest.yml` 文件中的 `application` 字段下加一个 `public_path` 子字段即可

另外有部分应用有自身的独立鉴权机制，比如通过url中携带token，则可以将此类服务地址的强制鉴权关闭。

```yml
application:
  public_path:
    - /api/public
```

上面配置的意思是， 当浏览器访问 `/api/public` 路由时， 可以直接访问， 不需要输入用户名密码。

需要注意的是：
1. `public_path` 仅是关闭微服的http账号密码鉴权，访问时依旧需要登录微服客户端建立虚拟网络
2. `public_path` 有一定的风险， 请不要对外暴露敏感 API， 比如读取您的文件的服务


此外，还可以使用`!`排除语法，将除`/admin`外的整个路径都绕过强制鉴权。(不推荐使用此方式绕过强制鉴权)
```yml
application:
  public_path:
    - /
    - !/admin
```

::: warning 排除语法具有最高优先级，不支持嵌套判断
比如上述规则中如果添加 `/admin/unsafe` 这条规则是不会生效的。
:::



## TCP/UDP 服务 {#tcp-udp-ingress}

::: warning 正常http请使用路由功能
ingress的TCP/UDP转发能是为了提供给微服客户端之外使用，比如命令行或第三方应用。
如果只是为了转发容器的某个http端口，请使用lzcapp的[http路由功能](./advanced-route.md)。
:::


上面介绍了公开 HTTP 服务的方法， 如果您想提供一些 TCP/UDP 服务，
可以在 `lzc-manifest.yml` 文件中的 `application` 字段下加一个 `ingress` 子字段

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
- `port`: 目标服务的端口号，若不写则为实际入站端口号。
- `service`: 服务名称，用来定位具体的`service container`。默认值为`app`
- `publish_port`: 入站端口号，默认值为`port`对应的端口号。支持`3306`以及`1000-50000`两种写法。

设置好以后， 就可以通过浏览器来进行访问啦, 比如您的应用域名为 `app-subdomain` (lzc-manifest.yml 文件的 subdomain 字段)， 设备名为 `devicename`, 您就可以通过访问 `app-subdomain.devicename.heiyu.space:3306` 来访问对外提供的 TCP 服务啦。

::: warning 安全提示
当您使用TCP/UDP功能时，微服系统仅能提供底层虚拟网络的保护，从原理上无法提供鉴权流程。
微服客户端上的其他进程可以不受限制的访问对应TCP/UDP端口。
若用户使用端口转发工具进行转发则会进一步降低安全性，因此开发者在提供TCP/UDP功能时一定要妥善处理鉴权逻辑。
:::
