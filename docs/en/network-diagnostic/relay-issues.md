---
navbar: false
sidebar: false
next: false
prev: false
---

# Relay

- Please check proxy routing rules to ensure the "Bypass Mainland China" option is enabled. Also configure "6.6.6.6" and "2000::6666" to bypass proxy.

Clash

```
rules:
  - GEOIP,CN,DIRECT
tun:
  route-exclude-address:
    - 6.6.6.6/32
    - 2000::6666/128
```
