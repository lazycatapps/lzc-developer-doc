# 应用域名规则
虽然lzcapp都运行在独立的容器中，但是lzcapp中的多个service之间可以互相访问。下面就来介绍一下应用内各服务的域名规则：

## 服务域名构造规则
每个容器的 service 访问遵循特定的域名格式，以确保服务间的隔离和访问控制。

### 单实例（单用户）应用
在 `单实例应用` 中，service 之间的访问通过以下域名格式进行：
```
${service_name}.${lzcapp_appid}.lzcapp
```

- ${service_name}：容器内部的服务名称。

- ${lzcapp_appid}：应用的唯一 ID。

- .lzcapp：固定的顶级域。

示例:
```
db.example.app.id.lzcapp
^^ ^^^^^^^^^^^^^^
|  |_____________${lzcapp_appid}
|
|________________${service_name}
```

### 多实例（多用户）应用
如果该应用支持 `多用户实例`，可以通过以下格式访问特定用户的实例：
```
${userId}.${service_name}.${lzcapp_appid}.lzcapp
```
- ${userId}：用户 ID，用于标识该用户的实例。

示例：
```
user42.db.example.app.id.lzcapp
```
表示 `user42` 访问 `lzcapp_appid = example.app.id` 中的 db 服务。

### 特殊域名

- **host.lzcapp**

此域名将解析到lzc-docker网桥。
当lzcapp的服务使用`host`[网络模式](./spec/manifest.md#71-容器配置-container-config)时。服务内容器可以
监听在`host.lzcapp`上使得其他应用可以访问到此服务。

- **_outbound**

此域名将解析到懒猫微服的默认出口IP。

- **_gateway**

此域名将解析到懒猫微服所在网络的网关。

:::tip 应用间网络隔离

lzcos-1.3.x前各个应用间网络并未完全隔离，隔离后使用对应服务的域名也可以获取到ip地址，但是无法访问。

:::