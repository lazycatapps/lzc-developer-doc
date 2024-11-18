<!--
 * @Author: Bin
 * @Date: 2024-11-18
 * @FilePath: /lzc-developer-doc/docs/advanced-envs.md
-->
# 环境变量

在应用配置 `lzc-manifest.yml` 的 `services` 中可以配置每个服务的 `environment`，如下配置 `bitnami/wordpress:5.8.2` 环境变量示例。

```
services:
  wordpress:
    image: bitnami/wordpress:5.8.2
    environment:
      - ALLOW_EMPTY_PASSWORD=yes
      - LAZYCAT_AUTH_OIDC_CLIENT_ID=xxx
      - LAZYCAT_AUTH_OIDC_CLIENT_SECRET=xxx
      - LAZYCAT_AUTH_OIDC_ISSUER_URL=xxx
```

除此之外微服会给每个应用的容器添加一些默认的环境变量可以参考 [默认环境变量列表](#默认环境变量列表)

## 默认环境变量列表
| 变量名 | 示例值 | 描述 |
| -- | -- | -- |
| LAZYCAT_BOX_NAME | example | boxName 微服名称 |
| LAZYCAT_BOX_DOMAIN | example.heiyu.space | boxDomain 微服域名 |
| LAZYCAT_APP_ID | cloud.lazycat.app.helloworld | package 应用 ID |
| LAZYCAT_APP_DOMAIN | helloworld.example.heiyu.space | appDomain 应用域名 |
| LAZYCAT_APP_SERVICE_NAME | wordpress | services 服务名 |
