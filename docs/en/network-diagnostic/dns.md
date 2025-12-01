---
navbar: false
sidebar: false
next: false
prev: false
---
# DNS

- In proxy configuration, add rules to bypass "*.heiyu.space".

Clash:

```
dns:
  fake-ip-filter:
    - "*.heiyu.space"
```
