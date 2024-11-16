## 开发环境搭建
懒猫微服的应用的开发环境支持 Windows, Linux, macOS， 下面是开发环境的安装步骤:

1. 安装依赖

- 首先需要按照 [Node.js](https://nodejs.org/zh-cn) 和 [懒猫微服客户端](https://lazycat.cloud/download)

2. 安装懒猫云开发者工具

- 懒猫云开发者工具是构建、 安装和部署懒猫微服应用的后台工具, 通过懒猫微服客户端商店， 搜索并安装[“懒猫开发者工具”](https://appstore.lazycat.cloud/#/shop/detail/cloud.lazycat.developer.tools)。

3. 安装 lzc-cli

- lzc-cli 是运行在开发者终端的命令行工具， 可以认为是懒猫云开发工具的前端。

```bash
npm install @lazycatcloud/lzc-cli -g
```

4. 安装系统依赖

根据您的操作系统， 安装系统依赖。

- **Ubuntu / Debian**:

  ```bash
  sudo apt update
  sudo apt install openssh-client rsync
  ```

- **macOS**:

  ```bash
  brew install openssh rsync
  ```

  `macOS` 系统自带的 `rsync` 版本较老，请使用 `Homebrew` 安装的 `rsync 版本 (v3.2.0+)`

- **Windows**

  Windows 10 以上已经自带 `ssh.exe`，不再需要额外安装其他依赖。

- **Windows (WSL)**:

  > Windows WSL 更多使用指南可以参考 [lzc-cli-wsl](./lzc-cli-wsl)

  ```bash
  sudo apt update
  sudo apt install openssh-client rsync
  ```
