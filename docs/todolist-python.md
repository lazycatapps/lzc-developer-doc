# 第一个 Python 应用
真实的 Web 应用一般都有前后端， 前端专注界面的绘制， 后端提供服务和数据存储。 下面我们就用 Python 来开发一个真实的 Web 应用 - 待办清单， 通过对‘清单’的创建、 修改和删除来讲解 Python 后台的构建细节。

## 下载应用源码
使用下面的命令先下载代办清单的源代码：

```shell
https://gitee.com/lazycatcloud/todolist-py-lzcapp-demo.git
```

下载后的目录结构如下：
```shell
.
├── ui                // 前端代码
├── backend           // 后端代码
├── build.sh          // 项目二进制文件构建脚本
├── lzc-build.yml     // 懒猫应用构建脚本
├── lzc-manifest.yml  // 懒猫应用 Meta 信息配置
├── lzc-icon.png      // 懒猫应用图标
└── README.md         // 项目简介
```

## 快速测试
根据我们前面学习的知识， 我们先快速启动一下这个应用:

1. 构建前端

启动第一个终端， 启动前端服务:

```shell
# 进入远程应用容器的 shell
lzc-cli project devshell

# 进入容器 shell 后
cd ui
npm install
npm run dev
```

2. 构建后端

启动第二个终端， 启动后端服务：

```shell
lzc-cli project devshell

# 进入容器 shell 后
cd backend
pip install -r requirements.txt --break-system-packages
python main.py
```

3. 启动应用

前后端服务后， 点击启动器图标就可以查看代办清单应用的效果啦。

## 构建应用
前面讲解的知识， 都需要开发者在本地或者微服中手动启动应用服务后， 应用才能正常运行。 但是， 每次重启微服后， 都需要执行一遍构建命令， 非常不方便。

下面， 我们教大家构建自己的第一个应用安装包， 通过安装包， 我们可以把应用安装到微服中， 每次点击启动器应用图标， 应用的前后端服务会自动启动。

1. 构建应用

首先,我们需要通过 lzc-cli 去构建我们的应用输出一个 lpk 文件：

```shell
# 在本地安装应用 npm 依赖
cd ui
npm install

# 构建 lpk
lzc-cli project build -o release.lpk

```

2. 安装应用

通过下面命令安装到懒猫微服中

```shell
lzc-cli app install release.lpk
```

安装应用包后， 就可以通过启动器点击应用图标啦， 我们的第一个应用就这样部署完了， 是不是很有成就感？
