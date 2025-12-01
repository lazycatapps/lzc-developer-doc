# manifest.yml Rendering

lzcos-v1.3.8+ supports dynamic rendering of manifest.yml files, so developers can better control deployment parameters.

The rendering process of manifest.yml is:

1. Developers create a [lzc-deploy-params.yml](./spec/deploy-params) file in the project root directory and package it into lpk using `lzc-cli project build` (requires lzc-cli version v1.3.7+)
2. Before running, it will jump to a parameter supplement UI interface, requiring users to supplement all parameters defined by developers in `lzc-deploy-params.yml`
3. The system obtains the parameters provided by users and renders them together with lzc-manifest.yml in lpk as template parameter `U` to get the final result
4. Store the final manifest in `/lzcapp/run/manifest.yml` (relative to the original file `/lzcapp/pkg/manifest.yml`) and use it as the final file


--------------

1. Users can actively re-enter the page to modify deployment parameters in the application list. After clicking, enter step 2. Each time deployment parameters are modified, the application instance will be stopped and the above process will be re-executed
2. For multi-instance applications, each user's deployment parameters are independent and filled in by each user themselves.
3. Even if the application does not configure `lzc-deploy-params.yml`, the manifest rendering process will still be performed

## Rendering Mechanism

Uses golang's `text/template` to render manifest.yml in lpk. You need to familiarize yourself with [Go's official template syntax](https://pkg.go.dev/text/template) first.
Below are some built-in template functions and template parameters.


## Built-in Template Functions

1. Functions supported by [sprig](https://masterminds.github.io/sprig/). (env related excluded)
2.  `stable_secret "seed"` template function, used to generate stable passwords. This function needs to pass an arbitrary string.
    1. Same seed, different applications guarantee different results
    1. Same seed, same application different LCMD guarantee different results
    2. Same seed, same application same LCMD (without factory reset) guarantee same result for multiple calls

## Template Parameters

Mainly two large parameters (abbreviations in parentheses)

- `.UserParams(.U)` Parameters required in lzc-deploy-params.yml

- `.SysParams(.S)` System-related parameters
    - `.BoxName`  LCMD name
    - `.BoxDomain`  LCMD domain
    - `.OSVersion`  LCMD system version number, note that if it is a test version, it will be forcibly modified to `v99.99.99-xxx`
    - `.AppDomain`  Application domain, note that this domain is currently hardcoded by developers, will be dynamically allocated in the future and support administrator dynamic adjustment.
    - `.IsMultiInstance` Whether it is multi-instance deployment mode, currently hardcoded by developers, future versions will be adjusted so administrators can dynamically adjust the final value.
    - `.DeployUID`  Actual user ID during deployment, this field does not exist in single-instance deployment.
    - `.DeployID`   Unique ID of the instance itself



::: tip
During debugging, you can add at any position in lzc-manifest.yml to render all available parameters
```
xx-debug: {{ . }}
```

You can add a rule in `application.route` to view the final manifest.yml
```
application:
    route:
        - /m=file:///lzcapp/run/manifest.yml
```
Or directly use devshell and then `cat /lzcapp/run/manifest.yml`
:::

## Examples

Complete demo examples can be found [here](https://gitee.com/lazycatcloud/netmap)

### More Secure Internal Passwords

```yml
package: cloud.lazycat.app.redmine
name: Redmine
services:
  mysql:
    binds:
    - /lzcapp/var/mysql:/var/lib/mysql
    environment:
    - MYSQL_ROOT_PASSWORD={{ stable_secret "root_password" }}
    - MYSQL_USER=LAZYCAT
    - MYSQL_PASSWORD={{ stable_secret "admin_password" | substr 0 6 }}
    image: registry.lazycat.cloud/mysql
  redmine:
    environment:
    - DB_PASSWORD={{ stable_secret "root_password" }}
```

### Multi-Instance/Single-Instance Different Configurations

If it is a single-instance application, put data in each user's document directory

If it is a multi-instance application, put user data inside the application


```yml
#lzc-manifest.yml

services:
  some_service_name:
    binds:
    {{ if .S.IsMultiInstance }}
      - /lzcapp/run/mnt/home:/home/
    {{ else }}
      - /lzcapp/run/mnt/home/{{ .S.DeployUID }}/the_name:/home/
    {{ end }}
```


### Startup Parameters Configured by User
```yml
#lzc-deploy-params.yml
params:
  - id: target
    type: string
    name: "target"
    description: "the target IP you want forward"

  - id: listen.port
    type: string
    name: "listen port"
    description: "the forwarder listen port, can't be 80, 81"
    default_value: "33"
    optional: true
```

```yml
#lzc-manifest.yml
package: org.snyh.netmap
version: 0.0.1
name: netmap
application:
  subdomain: netmap

  upstreams:
    - location: /
      backend_launch_command: /lzcapp/pkg/content/netmap -target={{ .U.target }} -port={{ index .U "listen.port" }}
```
