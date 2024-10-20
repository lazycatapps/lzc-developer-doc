# lzc-cli
懒猫微服应用开发需要两个工具：
1. 懒猫云开发者工具： 您可以认为这个工具是构建、 安装应用的服务端工具
2. lzc-cli: lzc-cli 是运行在开发者终端的命令行工具， 可以认为是懒猫云开发工具的前端

需要这两个工具都安装完成后才能继续开发。

## 支持的操作系统

- Windows
- Linux
- Mac

## 安装步骤

1. 安装依赖
首先需要按照 [Node.js](https://nodejs.org/zh-cn) 和 [懒猫微服客户端](https://lazycat.cloud/download)

2. 安装懒猫云开发者工具

通过懒猫微服客户端商店， 搜索并安装[“懒猫开发者工具”](https://appstore.lazycat.cloud/#/shop/detail/cloud.lazycat.developer.tools)。

3. 安装 lzc-cli

懒猫应用开发命令行工具。

```bash
npm install @lazycatcloud/lzc-cli -g
```

4. 安装系统依赖

根据你的操作系统， 安装以下依赖。

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
