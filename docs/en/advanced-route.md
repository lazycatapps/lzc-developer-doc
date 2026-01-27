Routing Rules
=========

The `application.routes` field is of type `[]Rule`

Rule is declared in the form of `URL_PATH=UPSTREAM`, where `URL_PATH` is the actual URL path when the browser accesses (excluding the hostname part),
`UPSTREAM` is the specific upstream service, currently supports the following 3 protocols

- `file:///$dir_path`
- `exec://$port,$exec_file_path`
- `http(s)://$hostname/$path`

Note: `application.routes` trims the `URL_PATH` prefix when forwarding. For example, with:
```
routes:
  - /api/=http://backend:80
```
a browser request to `/api/v1` will be forwarded to the backend as `/v1`.
If you need to keep the prefix, use `application.upstreams` and set `disable_trim_location: true` (lzcos v1.3.9+).

HTTP Upstream
=======

`http/https` supports internal or external services. For example, the built-in app store lzcapp only has one line of code.

```
routes:
    - /=https://appstore.lazycat.cloud
```
When accessing `https://appstore.$LCMD_NAME.heiyu.space`, all requests will be directly forwarded to the upstream `https://appstore.lazycat.cloud`. In this
case, the js code in the page can still use the functions of `lzc-sdk/js`. The app store's install\open logic runs in LCMD, but the code is deployed on public cloud for unified maintenance.

In most cases, lzcapp's http routing forwards to a certain service's http port within the application. For example, the `bitwarden` password management lzcapp forwards the entire lzcapp's
http service to bitwarden service's port 80.

```
package: cloud.lazycat.app.bitwarden
description: A free and open source password management service
name: Bitwarden

application:
  routes:
  - /=http://bitwarden.cloud.lazycat.app.bitwarden.lazcapp:80
  - /or_use_this_short_domain=http://bitwarden:80
  subdomain: bitwarden
services:
  bitwarden:
    image: bitwarden/nginx:1.44.1

```

1. `bitwarden` in `http://bitwarden:80` is the service name in services. This name will be automatically resolved to the service's actual ip at runtime.
2. The writing of `http://bitwarden.cloud.lazycat.app.bitwarden.lzcapp:80` is `$service_name.$appid.lzcapp`

Notes
1. After lzcos-1.3.x, application isolation will be introduced, prohibiting mutual access between applications. Therefore, if there is no special reason, using `service_name` form as the domain name is simpler and also convenient for modifying appid. (`xxx.lzcapp` itself will not be deprecated, any application can resolve to the correct IP, but after isolation, it cannot access the target IP)
2. But the following special cases still need to use `xxx.lzcapp` domain name form
   1. Before lzcos-1.3.x, because application isolation was not performed, all applications saw `service_name` as interconnected. When different applications have the same service_name, they may be incorrectly resolved to other container IPs.
      Therefore, when `service_name` is `app`, `db` and other cases that are likely to conflict, you still need to use `xxx.lzcapp` form before application network isolation.
   2. If the upstream service will detect `http request host` and the like, you need to use `xxx.lzcapp` form, otherwise when the upstream service parses the http request,
      `http header host` will be `service_name` instead of `aaaa.xxx.heiyu.space`.
      This limitation is because the upstream service may also be a public network service. In this case, the host must be passed to the upstream unchanged, otherwise cross-origin and other problems are likely to occur.
      If you have related needs, it is recommended to use `upstreams.[].use_backend_host=true` to explicitly specify this behavior.

File Upstream
=========

File routing is used to load static html files. For example, pptist lzcapp is a pure frontend application, so it only uses one static file routing rule and does not run any other services

```
package: cloud.lazycat.app.pptist
name: PPTist
description: An online presentation (slides) application based on Vue3.x + TypeScript
application:
  subdomain: pptist
  routes:
    - /=file:///lzcapp/pkg/content/
  file_handler:
    mime:
      - x-lzc-extension/pptist         # app supports .pptist
    actions:  # URL path to open corresponding files, called by file manager and other apps
      open: /?file=%u   # %u is a specific file path on a webdav, must have file name suffix

```

Generally, static resources are introduced when the lpk file is packaged. The contentdir content corresponding to lpk will eventually be stored in the `/lzcapp/pkg/content/` directory in readonly form unchanged at runtime


Exec Upstream
=========

`exec://$port,$exec_file_path` routing is slightly special, consisting of two parts

1. The final service port number $port, here the host is implicitly forced to be 127.0.0.1
2. The specific executable file path. Can be a script or elf file under any path.

When lzcapp starts, the system will execute the `$exec_file_path` file in the exec route, and assume that the service provided by this file runs on `http://127.0.0.1:$port`.
The system itself does not detect whether this service is really started by `$exec_file_path`. (Therefore, you can also do some initialization-related operations based on this feature)

An lzcapp can create any number of different types of routing rules. For example, the official LCMD Cloud Drive lzcapp routing rules are

```
application:
  image: registry.lazycat.cloud/lzc/lzc-files:v0.1.47
  subdomain: file
  routes:
    - /api/=exec://3001,/lzcapp/pkg/content/backend
    - /files/=http://127.0.0.1:3001/files/
    - /=file:///lzcapp/pkg/content/dist
```

The frontend page is provided by static files `/lzcapp/pkg/content/dist`,
all paths starting with `/api/` are provided by the executable file `/lzcapp/pkg/content/backend` after startup on `http://127.0.0.1:3001`,
and all paths starting with `/files/` are also forwarded to `http://127.0.0.1:3001/files`.



UpstreamConfig
===============
In addition (v1.3.8+), you can use the [applications.upstreams](./spec/manifest.md) field to configure more detailed routing rules,

For example,
```
subdomain: debug

routes: # Simple version routes can also work together
  - /=http://app1.org.snyh.debug.whoami.lzcapp:80

upstreams:
  # Explicitly specify some subtle behaviors
  - location: /search
    backend: https://baidu.com/
    use_backend_host: true  # If not set, external servers will generally reject service because the host field is incorrect
    disable_auto_health_checking: true # Don't do health checking for this route
    remove_this_request_headers: # Remove origin, referer and other headers to avoid cross-origin and other problems
      - origin
      - Referer
    disable_url_raw_path: true # Also normalize the original url

  # Skip backend self-signed SSL certificate issues
  - location: /other
    backend: https://app2.snyh.debug.lzcapp:4443 # Normally this domain name will not have a legitimate certificate
    disable_backend_ssl_verify: true # Therefore need to configure skipping SSL verification here

  # Use domain_prefix for domain prefix-based routing
  - location: /
    domain_prefix: config  # When accessing https://config-debug.xx.heiyu.space/, use the rules here
    backend: http://config.snyh.debug.lzcapp:80

  # Use backend_launch_command to replace exec routing rules, semantics are clearer
  - location: /api
    backend: http://127.0.0.1:3001/
    backend_launch_command: /lzcapp/pkg/content/my-super-backend -listen :3001

```
