---
navbar: false
sidebar: false
next: false
prev: false
---
# Windows Registry

参考 https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/configure-ipv6-in-windows

设置 `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters\DisabledComponents` 为 `0`
