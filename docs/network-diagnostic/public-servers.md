---
navbar: false
sidebar: false
next: false
prev: false
---
# Public servers

- 在代理配置中，添加规则绕过懒猫微服公共服务器的域名。

Clash:

```
rules:
  - DOMAIN-SUFFIX,lazycat.cloud,DIRECT
  - DOMAIN-SUFFIX,lazycatcloud.com,DIRECT
  - DOMAIN-SUFFIX,lazycatmicroserver.com,DIRECT
```
