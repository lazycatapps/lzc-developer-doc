---
navbar: false
sidebar: false
next: false
prev: false
---
# DNS

- 在代理配置中，添加规则绕过"*.heiyu.space"。

Clash:

```
dns:
  fake-ip-filter:
    - "*.heiyu.space"
```
