<!--
 * @Author: Bin
 * @Date: 2024-11-18
 * @FilePath: /lzc-developer-doc/docs/advanced-envs.md
-->
# Developer Environment Variables

In the application configuration `lzc-manifest.yml`, you can configure the `environment` for each service in `services`, as shown in the following example of configuring environment variables for `bitnami/wordpress:5.8.2`.

```
services:
  wordpress:
    image: bitnami/wordpress:5.8.2
    environment:
      - ALLOW_EMPTY_PASSWORD=yes
      - DISABLE_FEATURE_ABC=yes
```

## Runtime Environment Variable List {#runtime_envs}

Each container will automatically inject the following environment variables in the runtime environment. Other variables need to be manually injected by developers.

| Variable Name | Example Value | Description |
| -- | -- | -- |
|LAZYCAT_APP_DEPLOY_UID| admin | User to whom the container belongs in multi-instance applications. If empty, it indicates single-instance deployment (introduced in lzcos-v1.2)|
|LAZYCAT_APP_DOMAIN|l4test.snyht3.heiyu.space|Domain assigned to the application. Do not permanently store this value, as it may change after restart in subsequent versions|
|LAZYCAT_APP_ID|test.lzcos.l4ingress|Application's appid, equivalent to /lzcapp/pkg/manifest.yml:Package field|
|LAZYCAT_APP_SERVICE_NAME|app|Name of the service to which the current container belongs|
|LAZYCAT_BOX_DOMAIN|snyht3.heiyu.space|LCMD's main domain name. Do not permanently store this value, as it may change after restart in subsequent versions|
|LAZYCAT_BOX_NAME|snyht3|LCMD name|


## Deployment Environment Variable List  {#deploy_envs}

During the deployment configuration phase (when the system parses lzc-manifest.yml), you can use the following environment variable values. Use `${ENV_NAME}` in lzc-manifest.yml.

For example:
```
services:
  iperf:
    image: registry.lazycat.cloud/snyh1010/some_nginx:2694e91b783def0b
    command: -my-domain ${LAZYCAT_APP_DOMAIN}
```

| Variable Name | Example Value | Description |
| -- | -- | -- |
|LAZYCAT_APP_DEPLOY_UID| admin | User to whom the container belongs in multi-instance applications. If empty, it indicates single-instance deployment (introduced in lzcos-v1.2)|
|LAZYCAT_APP_DEPLOY_ID| xx.yy.zz | Instance's own ID (introduced in lzcos-v1.3.8)|
|LAZYCAT_APP_DOMAIN|l4test.snyht3.heiyu.space|Domain assigned to the application. Do not permanently store this value, as it may change after restart in subsequent versions (introduced in lzc-os-v1.2)|
|LAZYCAT_APP_ID|test.lzcos.l4ingress|Application's appid, equivalent to /lzcapp/pkg/manifest.yml:Package field|
|LAZYCAT_BOX_DOMAIN|snyht3.heiyu.space|LCMD's main domain name. Do not permanently store this value, as it may change after restart in subsequent versions|
|LAZYCAT_BOX_NAME|snyht3|LCMD name|
|LAZYCAT_AUTH_OIDC_CLIENT_ID|test.lzcos.l4ingress|OAuth client id|
|LAZYCAT_AUTH_OIDC_CLIENT_SECRET|a3deb9086885cbbc7|OAuth secret randomly generated during installation phase. Changes every time the container restarts, so do not save it in the database|
|LAZYCAT_AUTH_OIDC_ISSUER_URI|xxx|OAuth issuer address|
|LAZYCAT_AUTH_OIDC_AUTH_URI|xxx|AUTH endpoint address|
|LAZYCAT_AUTH_OIDC_TOKEN_URI|xxx|Token endpoint address|
|LAZYCAT_AUTH_OIDC_USERINFO_URI|xxx|Userinfo endpoint address|

ps: OIDC-related environment variables are only injected when `application.oidc_redirect_path` exists
