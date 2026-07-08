---
navbar: false
sidebar: false
next: false
prev: false
---
# Public servers

- In proxy configuration, add rules to bypass LCMD MicroServer public service server domains.

For more details, see the [configuration wizard tool](https://catlazy.xyz) or [configuration documentation](https://github.com/wlabbyflower/peppapigconfigurationguide).

Clash:

```
rules:
  - DOMAIN-SUFFIX,lazycat.cloud,DIRECT
  - DOMAIN-SUFFIX,lazycatcloud.com,DIRECT
  - DOMAIN-SUFFIX,lazycatmicroserver.com,DIRECT
```
