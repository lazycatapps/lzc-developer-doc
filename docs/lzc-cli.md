## 配置开发环境
懒猫微服的应用的开发环境支持 Windows, Linux, macOS， 下面是开发环境的安装步骤:

1. 安装依赖
首先需要按照 [Node.js](https://nodejs.org/zh-cn) 和 [懒猫微服客户端](https://lazycat.cloud/download)

2. 安装懒猫云开发者工具

安装懒猫云开发者工具是构建、 安装和部署懒猫微服应用的后台工具, 通过懒猫微服客户端商店， 搜索并安装[“懒猫开发者工具”](https://appstore.lazycat.cloud/#/shop/detail/cloud.lazycat.developer.tools)。

3. 安装 lzc-cli

lzc-cli 是运行在开发者终端的命令行工具， 可以认为是懒猫云开发工具的前端。

```bash
npm install @lazycatcloud/lzc-cli -g
```

4. 安装系统依赖

根据你的操作系统， 安装系统依赖。

- **Ubuntu / Debian**:

  ```bash
  sudo apt update
  sudo apt install openssh-client unzip rsync
  ```

- **macOS**:

  ```bash
  brew install openssh unzip rsync
  ```

- **Windows (WSL)**:

  ```bash
  sudo apt update
  sudo apt install openssh-client unzip rsync
  ```

## 开发模式

懒猫微服有两种开发模式， Docker 和 KVM 两种模式。

- **Docker 模式**： 这种模式的优点是， 应用权限更容易管理， 文件系统隔离的特性很适合应用开发和部署， 缺点是细节比较多
- **KVM 模式**： 这种模式的优点是， 更像公有云开发环境， 装一些软件库在虚拟机环境， 通过懒猫微服外网穿透能力快速做一些技术原型实验， 缺点是文件系统不分离， 不适合做应用分发
