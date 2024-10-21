命令解释:

- ​`lzc-cli project build`​

  会读取当前目录的 lzc-build.yml 文件,根据配置将一些图标,资源,配置打包到 lpk 中,其中:

  - contentdir: 指定打包的内容,将会打包到 lpk 中.
  - buildscript: 执行用户构建脚本,这里是一般是将前后端构建好后的文件移动到 contentdir 中

- ​`-o release.lpk`​<br />指定输出 lpk 名称

至此,我们打包完成得到一个 lpk 安装包,然后再通过下面命令安装到懒猫微服中

```shell
lzc-cli app install release.lpk
```

进行完这一步之后,应用就可以在您的懒猫微服中正常使用了.<br />最后,我们讲解一下他是如何启动前后端的呢,这里就需要看到我们 `lzc-manifest.yml`​ 这个文件了

```shell
application:
  routes:
    - /=file:///lzcapp/pkg/content/web
    - /api/=exec://3000,./lzcapp/pkg/content/backend/run.sh
```

其实就是这里配置了我们的前后端路由转发,下面来解释一下

- ​`/=file:///lzcapp/pkg/content/web`​

  这个路由表示， 当用户访问根路径 `/`​ 时， 应用程序将会提供位于 `file:///lzcapp/pkg/content/web`​ 的文件。 而这个 web 目录正是我们打包构建出来的前端文件

- ​**`/api/=exec://3000,./lzcapp/pkg/content/backend/run.sh`**​:

  这个路由表示， 当用户访问 `/api/`​ 路径时， 应用程序会执行一个命令（`exec://3000`​）， 后面的 **`./lzcapp/pkg/content/backend/run.sh`**​ 是执行的程序路经， 该脚本最终会启动一个 3000 端口运行。

- ​`/lzcapp/pkg/content`​

  这个目录存放者 lpk 构建时 contentdir 目录的内容

- ​`/lzcapp/var`​

  这个目录是懒猫 app 专门用来存放应用数据的,可以将应用产生的数据文件存在这里

好了,这里就是这节应用的全部了.快去尝试一下吧!
‍
