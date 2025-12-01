One Application Using Multiple Domains
===================

`lzc-manifest.yml:application.subdomain` is the domain name expected by developers, but the LCMD system (after v1.3.6+) will make certain adjustments

1. If multiple applications use the same `subdomain` field, the one installed later will have a domain suffix added
2. For multi-instance type applications, each user of the same application will be assigned an independent domain, so non-administrators will most likely see domains with suffixes added
3. Domain prefix concept: The domain `xxxx-subdomain` has the same effect as `subdomain`, meaning each application automatically has any number of domains.
4. The final actually assigned `subdomain` can only be obtained through the environment variable `LAZYCAT_APP_DOMAIN`.
5. All traffic entering from prefix domains will ignore `TCP/UDP Ingress` configuration. (Does not affect traffic entering from default application domain)


v1.3.8 supports [Domain-based Traffic Forwarding](./advanced-route#upstreamconfig)

Since `application.routes` does not support domain-based forwarding, if you need more detailed routing rule adjustments,
you can add a special route rule, `- /=http://nginx.$appid.lzcapp`.
Note that you must use the `$service.$appid.lzcapp` form here, otherwise nginx cannot receive complete domain information, [see reason](advanced-route.html#p2)

For example, the effect of the following configuration is:
1. Opening from the application list defaults to `whoami.xx.heiyu.space` (assuming the actually assigned `subdomain` is `whoami`)
2. `nginx-whoami.xx.heiyu.space` traffic will return the default nginx static hello world
3. `any-content-whoami.xx.heiyu.space` has the same effect as accessing `whoami.xx.heiyu.space`


```yaml

package: org.snyh.debug.whoami
name: whoami-lazycatmicroserver

application:
  subdomain: whoami
  routes:
    - /=http://nginx.org.snyh.debug.whoami.lzcapp:80

services:
  nginx:
    image: registry.lazycat.cloud/snyh1010/library/nginx:54809b2f36d0ff38
    setup_script: |
      cat <<'EOF' > /etc/nginx/conf.d/default.conf
      server {  # whoami.xxx.heiyu.space and any other domain prefixes forward to traefik/whoami
         server_name _;
         location / {
            proxy_pass http://app1:80;
            # Currently the setup_script mechanism still has some issues, environment variables cannot be written directly here. If you have this need, you can
            # only use binds to put files in pkg/content and bind them in
         }
      }
      server {  # Domains starting with nginx forward to nginx default page, such as nginx3-whoami.xxx.heiyu.space, nginx-whoami.xxx.heiyu.space
         server_name  ~^nginx.*-.*;
         location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
         }
      }

      EOF
  app1:
    image: registry.lazycat.cloud/snyh1010/traefik/whoami:c899811bc4a1f63a
```
