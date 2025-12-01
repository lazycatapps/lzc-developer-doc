# Advanced Routing

## Introduction
The official maintains an APP Proxy image to help developers implement complex routing functions and view corresponding request logs.
APP Proxy is essentially an image based on Openresty, image address: `registry.lazycat.cloud/app-proxy:v0.1.0`.

## Usage Methods
There are currently two usage modes:
- Configuration through environment variables: Suitable for cases with only one HTTP upstream service
- Configuration through setup_script: Directly override Openresty's configuration file, can use any configuration supported by Openresty

::: danger
**Prohibited** to mix the two modes.
:::

Below is a detailed introduction to the usage of each mode.

### Environment Variables
APP Proxy abstracts some specific functions, allowing developers unfamiliar with Nginx/Openresty configuration to quickly configure through environment variables. Currently supported environment variables:

| Environment Variable | Function | Example |
| - | - | - |
| UPSTREAM (Required) | Set the upstream HTTP service to proxy | `UPSTREAM=http://whoami:80` |
| BASIC_AUTH_HEADER | Set Authorization header to bypass Basic Auth | `BASIC_AUTH_HEADER="Basic dXNlcjpwYXNzd29yZA=="` |
| REMOVE_REQUEST_HEADERS | Remove HTTP request headers, multiple headers separated by semicolons | `REMOVE_REQUEST_HEADERS="Origin;Host;"` |

### setup_script
Before starting, you need to understand [the principle of setup_script](advanced-setupscript.md); in addition, you also need to understand Nginx configuration.

You can directly override Openresty's configuration file in setup_script, and even write some Lua scripts for more complex configuration.

Here is a simple example:

```yaml
lzc-sdk-version: '0.1'
name: APP Proxy Test
package: cloud.lazycat.app.app-proxy-test
version: 0.0.1
application:
  routes:
    # Forward requests to APP Proxy (app-proxy service)
    - /=http://app-proxy:80
  subdomain: app-proxy-test
services:
  app-proxy:
    image: registry.lazycat.cloud/app-proxy:v0.1.0
    setup_script: |
      # Override Openresty's configuration file
      cat <<'EOF' > /etc/nginx/conf.d/default.conf
      # Any configuration supported by Nginx/Openresty
      server {
         server_name  app-proxy-test.*;
         location / {
            root   /usr/local/openresty/nginx/html;
            index  index.html index.htm;
         }
      }
```

## Examples
### View Application Request Logs
As long as APP Proxy is used, you can view request logs through `lzc-cli docker logs -f`.
For example, in the following example, you can view request logs through `lzc-cli docker logs -f cloudlazycatappapp-proxy-test-app-proxy-1`.
```yaml
lzc-sdk-version: '0.1'
name: APP Proxy Test
package: cloud.lazycat.app.app-proxy-test
version: 0.0.1
application:
  routes:
    - /=http://app-proxy:80
  subdomain: app-proxy-test
services:
  app-proxy:
    image: registry.lazycat.cloud/app-proxy:v0.1.0
    environment:
      - UPSTREAM="http://whoami:80"
  whoami:
    image: registry.lazycat.cloud/snyh1010/traefik/whoami:c899811bc4a1f63a
```

### Bypass Basic Auth
By setting the `BASIC_AUTH_HEADER` environment variable, you can inject the `Authorization` request header for requests, allowing the application to achieve password-free login.

The value of `BASIC_AUTH_HEADER` is `Basic base64(username:password)`. In the following example, assuming the username is `user` and the password is `password`, the base64 encoding obtained by `echo -n "user:password" | base64` is `dXNlcjpwYXNzd29yZA==`.

```yaml
lzc-sdk-version: '0.1'
name: APP Proxy Test
package: cloud.lazycat.app.app-proxy-test
version: 0.0.1
application:
  routes:
    - /=http://app-proxy:80
  subdomain: app-proxy-test
services:
  app-proxy:
    image: registry.lazycat.cloud/app-proxy:v0.1.0
    environment:
      - UPSTREAM="http://whoami:80"
      - BASIC_AUTH_HEADER="Basic dXNlcjpwYXNzd29yZA=="
  whoami:
    image: registry.lazycat.cloud/snyh1010/traefik/whoami:c899811bc4a1f63a
```

### Remove Request Headers
By setting the `REMOVE_REQUEST_HEADERS` environment variable, you can remove specific request headers.

For example, if we want to remove the Origin request header, we can set `REMOVE_REQUEST_HEADERS="Origin"`, and then the `Origin` request header will be removed.

```yaml
lzc-sdk-version: '0.1'
name: APP Proxy Test
package: cloud.lazycat.app.app-proxy-test
version: 0.0.1
application:
  routes:
    - /=http://app-proxy:80
  subdomain: app-proxy-test
services:
  app-proxy:
    image: registry.lazycat.cloud/app-proxy:v0.1.0
    environment:
      - UPSTREAM="http://whoami:80"
      - REMOVE_REQUEST_HEADERS="Origin;Cache-Control;"
  whoami:
    image: registry.lazycat.cloud/snyh1010/traefik/whoami:c899811bc4a1f63a
```

### Multi-Domain Support
Currently, LCMD MicroServer supports [one application using multiple domains](advanced-secondary-domains.md).

Combined with setup_script, you can implement complex routing functions, forwarding multiple domains to different backends of the application.

In the following example, different domains will be forwarded to different backends:
- `app-proxy-test.xxx.heiyu.space` will be forwarded to Openresty's default homepage
- `portainer.xxx.heiyu.space` will be forwarded to Portainer
- `whoami.xxx.heiyu.space` will be forwarded to whoami


```yaml
lzc-sdk-version: '0.1'
name: APP Proxy Test
package: cloud.lazycat.app.app-proxy-test
version: 0.0.1
application:
  routes:
    - /=http://app-proxy.cloud.lazycat.app.app-proxy-test.lzcapp:80
  subdomain: app-proxy-test # Default domain opened in application list
  secondary_domains:
    - portainer
    - whoami
services:
  app-proxy:
    image: registry.lazycat.cloud/app-proxy:v0.1.0
    setup_script: |
      cat <<'EOF' > /etc/nginx/conf.d/default.conf
      server {
         server_name  app-proxy-test.*;
         location / {
            root   /usr/local/openresty/nginx/html;
            index  index.html index.htm;
         }
      }

      server {
         server_name  portainer.*;

         location / {
            proxy_pass http://portainer:9000;
         }
      }

      server {
         server_name  whoami.*;

         location / {
            proxy_pass http://whoami:80;
         }
      }
      EOF
  portainer:
    image: registry.lazycat.cloud/u8997806945/portainer/portainer-ce:d393c0c7d12aae78
  whoami:
    image: registry.lazycat.cloud/snyh1010/traefik/whoami:c899811bc4a1f63a
```
