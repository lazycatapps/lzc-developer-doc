# Python 应用配置详解
上一章我们讲了怎么构建第一个 Python 应用， 这一章我们详细的分析 Python 应用的构建细节。

## lzc-build.yml

lzc-build.yml 这个文件是生成 lpk 的应用安装包的配置文件， 这个脚本的内容用一句话来形容： 根据 `buildscript` 定义的脚本， 把 `contentdir` 下面的所有文件打包成一个 lpk 压缩包， 最后安装到微服中。

## lzc-manifest.yml

lzc-manifest.yml 是控制应用 Meta 信息的配置文件。

先介绍一下这个配置文件基本的关键字和用处：
- `name`: 应用名称
- `package`: 应用的子域名， 如果不上架懒猫微服应用商店， 这个名字可以随便取
- `version`: 版本号
- `description`: 应用描述
- `license`: 应用的发行许可证
- `homepage`: 项目主页
- `author`: 作者信息

这个文件最重要的是 `application` 字段：

```shell
application:
  subdomain: todolistpy
  routes:
    - /=file:///lzcapp/pkg/content/web
    - /api/=exec://3000,./lzcapp/pkg/content/backend/run.sh
```

- `subdomain: todolistpy`

  应用子域名， 和上面的 `package` 字段的域名相关联。

- ​`/=file:///lzcapp/pkg/content/web`​

  这个路由表示， 当用户访问应用时， 也就是访问路由 `/` 时， 应用程序会自动返回 `/lzcapp/pkg/content/web` 目录下的 `index.html` 文件。 `/lzcapp/pkg/content` 其实就是对应前面 `lzc-build.yml` 文件中的 `contentdir` 目录。

- ​`/api/=exec://3000,./lzcapp/pkg/content/backend/run.sh`:

  这个路由表示， 当用户访问路由 `/api/`​ 时， 应用程序会启动 `./lzcapp/pkg/content/backend/run.sh` 脚本提供后端服务， 后端服务脚本监听 3000 端口。

## 保存数据的路径
当后端需要存储文件或者数据库时， 请确保文件放在 `/lzcapp/var`​ 目录下， 存在其他目录下的文件会在应用 Docker 重启后被系统清空。
