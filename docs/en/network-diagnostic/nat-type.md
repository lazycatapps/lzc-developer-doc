---
navbar: false
sidebar: false
next: false
prev: false
---
# NAT Type

If you have configured a proxy:

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

If you have not configured a proxy, your ISP may have configured NAT4.

You can contact your ISP to request changing to NAT3, or consider switching to another ISP.
