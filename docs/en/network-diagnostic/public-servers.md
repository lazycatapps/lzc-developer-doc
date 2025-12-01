---
navbar: false
sidebar: false
next: false
prev: false
---
# Public servers

- In proxy configuration, add rules to bypass LCMD MicroServer public service server domains.

Clash:

```
rules:
  - DOMAIN-SUFFIX,lazycat.cloud,DIRECT
  - DOMAIN-SUFFIX,lazycatcloud.com,DIRECT
  - DOMAIN-SUFFIX,lazycatmicroserver.com,DIRECT
```
