---
navbar: false
sidebar: false
next: false
prev: false
---
# DNS

- In proxy configuration, add rules to bypass "*.heiyu.space".

For more details, see the [configuration wizard tool](https://catlazy.xyz) or [configuration documentation](https://github.com/wlabbyflower/peppapigconfigurationguide).

Clash:

```
dns:
  fake-ip-filter:
    - "*.heiyu.space"
```
