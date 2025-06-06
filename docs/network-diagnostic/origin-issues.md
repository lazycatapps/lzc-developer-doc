---
navbar: false
sidebar: false
next: false
prev: false
---

# Origin

- 请检查代理分流规则，确保开启了"绕过中国大陆"选项。并且配置"6.6.6.6"和"2000::6666"绕过代理。

Clash

```
rules:
  - GEOIP,CN,DIRECT
tun:
  route-exclude-address:
    - 6.6.6.6/32
    - 2000::6666/128
```
