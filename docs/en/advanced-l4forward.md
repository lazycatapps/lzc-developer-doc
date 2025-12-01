# TCP/UDP Layer 4 Forwarding {#tcp-udp-ingress}

::: warning For normal HTTP traffic, please use the `application.routes` feature

The TCP/UDP forwarding capability of ingress is designed to be used outside of LCMD clients, such as command line or third-party applications.
If you only want to forward a certain HTTP port of a container, please use lzcapp's [HTTP routing feature](./advanced-route.md).

:::


If you want to provide some TCP/UDP services, you can add an `ingress` sub-field under the `application` field in the `lzc-manifest.yml` file

```yml
application:
  ingress:
    - protocol: tcp
      port: 8080
    - protocol: tcp
      description: Database service
      port: 3306
      service: mysql
    - protocol: tcp
      description: Forward ports 20K-30K to corresponding ports
      service: app
      publish_port: 20000-30000
    - protocol: tcp
      description: Forward all ports 16K-18K to port 6666
      service: app
      port: 6666
      publish_port: 16000-18000
```

- `protocol`: Protocol for external services, with `tcp` and `udp` options
- `description`: Description of this service, convenient for administrators to understand the basic situation
- `port`: Target service port number, if not written, it is the actual inbound port number. (Versions before v1.3.8 do not support `port` being 80 or 443)
- `service`: Service name, used to locate specific `service container`. Default value is `app`
- `publish_port`: Inbound port number, default value is the port number corresponding to `port`. Supports two formats: `3306` and `1000-50000`.

After setting it up, you can access it through the browser. For example, if your application domain is `app-subdomain` (subdomain field in lzc-manifest.yml file), and the device name is `devicename`, you can access the TCP service provided externally by accessing `app-subdomain.devicename.heiyu.space:3306`.

::: warning Security Notice
When you use TCP/UDP functionality, the LCMD system can only provide underlying virtual network protection and cannot provide authentication processes in principle.
Other processes on the LCMD client can access the corresponding TCP/UDP ports without restrictions.
If users use port forwarding tools for forwarding, it will further reduce security. Therefore, developers must properly handle authentication logic when providing TCP/UDP functionality.
:::

::: warning 80/443

When your application directly takes over 443 (supported in v1.3.8+), traffic goes directly to your container, so the system cannot do some preprocessing, including but not limited to

- Account authentication
- Automatic application wake-up
- HTTPS certificate configuration
- application.routes, application.upstreams and other configurations

In almost all cases, you should not use the 443 port configuration.

The only reasonable scenario currently envisioned is: using the EIP allocated by LCMD, forwarding all traffic to another host/NAS, and configuring a non-LCMD domain.

If you really want to handle 80/443 traffic yourself, you need to explicitly declare `yes_i_want_80_443:true` in the corresponding ingress entry

:::
