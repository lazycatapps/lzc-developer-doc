一个应用使用多个域名
===================

少量应用需要使用多个域名，可以使用`application.secondary_domains`字段来实现。

由于`application.routes`不支持基于域名的转发，如果需要比较细致的调整路由规则，
可以添加一条特殊route规则，`- /=http://nginx.$appid.lzcapp`。
注意这里一定要用`$service.$appid.lzcapp`的形式，否则nginx无法收到完整的域名信息，[原因见](advanced-route.html#p2)

比如，下面这个配置的效果是
1. whoami1.xx.heiyu.space, whoami2.xx.heiyu.space, whomai.xx.heiyu.space域名都对应的是相同应用
2. 应用列表里打开默认是whoami.xx.heiyu.space
3. whoami2流量会走真实的traefik/whoami应用，其他两个域名进来的流量会返回默认的nginx静态hello world

```yaml

package: org.snyh.debug.whoami
name: whoami-lazycatmicroserver

application:
  subdomain: whoami
  secondary_domains:
    - whoami1
    - whoami2

  routes:
    - /=http://nginx.org.snyh.debug.whoami.lzcapp:80

services:
  nginx:
    image: registry.lazycat.cloud/snyh1010/library/nginx:54809b2f36d0ff38
    setup_script: |
      cat <<'EOF' > /etc/nginx/conf.d/default.conf
      server {  #第一个server为默认server,如果其他地方没有匹配到则走这个
         server_name  whoami1.*;
         location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
         }
      }

      server {
         server_name  whoami2.*;  #所有whoami2.xxxx.heiyu.space的流量走 app1这个容器

         location / {
            proxy_pass http://app1:80;
            #目前setup_script机制还有点问题，这里不能直接写环境变量，如果有这个需求则
            #只能使用binds的形式把文件放到pkg/content中binds进去
         }
      }
      EOF

  app1:
    image: registry.lazycat.cloud/snyh1010/traefik/whoami:c899811bc4a1f63a
```
