# 使用 Python 开发一个 TodoList 应用

在懒猫云平台上， 开发者可以使用 Python 快速构建应用。 该项目是一个简单的 TodoList 应用， 后端使用 Python 语言开发， 前端使用 Vue.js 框架。

可以了解懒猫 app 的前后端开发流程以及应用数据的持久化存储。

克隆项目

```shell
https://gitee.com/lazycatcloud/todolist-py-lzcapp-demo.git
```

首先,讲解一下项目的构成

```shell
.
├── backend // 后端目录
├── build.sh // 构建脚本
├── lzc-build.yml // 懒猫应用构建配置文件
├── lzc-icon.png // 懒猫应用图标
├── lzc-manifest.yml // 懒猫应用程序配置文件
├── README.md
└── ui // 前端目录
```

在我们了解完之后就可以进行调试开发了,由于是前后端开发,我们需要同时开启前端服务和后端服务.最好开启两个终端进行开发调试

开启一个新的终端启动前端服务:

```shell
lzc-cli project devshell
# 进入容器后
cd ui
npm install
npm run dev
```

开启一个新的终端启动后端服务:

```shell
lzc-cli project devshell
# 进入容器后
cd backend
pip install -r requirements.txt --break-system-packages
python main.py
```

这个时候我们就将应用启动起来了,可以去懒猫微服客户端启动应用查看效果了!

接下来讲解一下如何在应用打包构建好,然后安装在自己的机器上长期使用

首先,我们需要通过 lzc-cli 去构建我们的应用输出一个 lpk 文件

```shell
lzc-cli project build -o release.lpk
# 成功后会看到多出来下面的目录结果
dist
├── backend
└── web
```

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

进行完这一步之后,应用就可以在你的懒猫微服中正常使用了.<br />最后,我们讲解一下他是如何启动前后端的呢,这里就需要看到我们 `lzc-manifest.yml`​ 这个文件了

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
