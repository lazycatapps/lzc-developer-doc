# Development Environment Setup

The development environment for LCMD MicroServer applications supports Windows, Linux, and macOS. Below are the installation steps for the development environment:

1. Install Dependencies

- First, you need to install [Node.js](https://nodejs.org/zh-cn) version 18 or higher and the [LCMD MicroServer Client](https://lazycat.cloud/download)

2. Install Lazycat Cloud Developer Tools

- Lazycat Cloud Developer Tools is a backend tool for building, installing, and deploying LCMD MicroServer applications. Through the LCMD MicroServer client store, search for and install ["Lazycat Developer Tools"](https://appstore.lazycat.cloud/#/shop/detail/cloud.lazycat.developer.tools).

3. <span style="display: flex; align-items: center;">Install lzc-cli &nbsp;<img style="display: inline-block;" alt="NPM Version" src="https://img.shields.io/npm/v/%40lazycatcloud%2Flzc-cli"></span>

- [lzc-cli](https://www.npmjs.com/package/@lazycatcloud/lzc-cli) is a command-line tool that runs on the developer's terminal. It can be considered as the frontend of Lazycat Cloud Developer Tools. Using it, you can develop, build, install, debug, and publish LCMD applications to the store.

```bash
# Install lzc-cli
npm install -g @lazycatcloud/lzc-cli
```


4. Install System Dependencies

Install system dependencies according to your operating system.

- **Ubuntu / Debian**:

  ```bash
  sudo apt update
  sudo apt install openssh-client rsync
  ```

- **macOS**:

  ```bash
  brew install rsync
  brew install openssh # You can skip this if you already have ssh
  ```

  The `rsync` version that comes with `macOS` is older, please use the `rsync` version (v3.2.0+) installed via `Homebrew`

- **Windows**

  Windows 10 and above already come with `ssh.exe`, so no additional dependencies need to be installed.

- **Windows (WSL)**:

  > For more usage guides on Windows WSL, please refer to [lzc-cli-wsl](./lzc-cli-wsl)

  ```bash
  sudo apt update
  sudo apt install openssh-client rsync
  ```

5. Connect to LCMD
   
 - Generate public key:
  
    ```bash
    # Please ensure ssh is installed and ssh-keygen generates the public key
    ssh-keygen -t ed25519
    ```

 - Add ssh public key to `Lazycat Developer Tools`
  
    ```bash
    lzc-cli box add-public-key # After execution, follow the prompts to click the link and complete adding the ssh public key
    ```