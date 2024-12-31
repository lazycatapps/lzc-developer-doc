# manifest.yml渲染

::: warning
此功能未发布
:::

lzcos-v1.2+支持manifest.yml文件的动态渲染，以便开发者可以更好的控制部署参数。

manifest.yml的转换流程为

1. 开发阶段通过lzc-cli打包进xxx.lpk文件中
2. 安装到微服后lpk会被解压到`/data/system/pkgm/apps/$appid`目录下
3. 在被要求运行前根据`/data/system/pkgm/apps/$appid`以及UID等运行时信息一起渲染到`/data/system/pkgm/run/$uid@$appid`目录下。
   此时manifest.yml文件会被渲染为最终结果。应用重启后会被重新渲染，(如果多实例)每个用户会独立渲染。
4. 将最终manifest.yml转换为docker规范并运行相关容器

## 渲染机制

使用golang的`text/template`对lpk中的emanifest.yml进行渲染，您需要先熟悉一下[Go官方的模板语法](https://pkg.go.dev/text/template)外
以下为一些内置的模板函数和模板参数。

## 内置模板函数

1. [spring](https://masterminds.github.io/sprig/)支持的函数。(env相关除外)
2.  `stable_secrt "seed"`模板函数，用来产生稳定的密码。此函数需要传递一个任意字符串。
    1. 同样的seed，不同应用的结果保证不相同
    1. 同样的seed，同样的应用不同的微服结果保证不相同
    2. 同样的seed，相同的应用相同的微服(未重新恢复出厂设置)保证多次调用结果相同

## 模板参数

主要为三个大参数(括号内为其简写方式)

- `.UserParams(.U)` lzc-deploy-params.yml中要求的参数

- `.Manifest(.M)`原始未经过渲染的lzc-manifest.yml文件，可以同个这个去引用`Package`之类的字段。注意这里的参数是驼峰命名法和yml中的字段名不同。

- `.SysParams(.S)`系统相关参数
    - `.BoxName`  微服的名称
    - `.BoxDomain`  微服的域名
    - `.OSVersion`  微服系统版本号，注意如果是测试版则会强制修改为`v99.99.99-xxx`
    - `.AppDomain`  应用的域名，注意此域名目前是根据开发者写死，将来会动态分配并支持管理员动态调整。
    - `.IsMultiInstance` 是否为多实例部署方式，目前是开发者写死，将来版本会调整为管理员可以动态调整最终值。
    - `.DepolyUID`  实际部署时的用户ID,单实例部署方案下无此字段。

::: tip
调试阶段，您可以在lzc-manifest.yml任意位置添加来渲染出所有的可用参数
```
xx-debug: {{ . }}
```


您可以在`application.route`里增加一条规则来查看最终的manifest.yml
```
application:
    route:
        - /m=file:///lzcapp/pkg/manifest.yml
```
或直接使用devshell后cat /lzcapp/pkg/manifest.yml
:::

## 示例

### 更安全的内部密码

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

### 获取域名信息

### 多实例/单实例不同配置

### 根据用户参数进行不同配置
