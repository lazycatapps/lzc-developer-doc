# First Python Application
Real web applications generally have frontend and backend. The frontend focuses on interface rendering, while the backend provides services and data storage. Below we will use Python to develop a real web application - a todo list, explaining the details of Python backend construction through creating, modifying, and deleting 'list items'.

## Download Application Source Code
Use the following command to download the todo list source code first:

```shell
https://gitee.com/lazycatcloud/todolist-py-lzcapp-demo.git
```

The directory structure after download is as follows:
```shell
.
├── ui                // Frontend code
├── backend           // Backend code
├── build.sh          // Project binary file build script
├── lzc-build.yml     // LCMD application build script
├── lzc-manifest.yml  // LCMD application Meta information configuration
├── lzc-icon.png      // LCMD application icon
└── README.md         // Project introduction
```

## Quick Test
Based on the knowledge we learned earlier, let's quickly start this application:

1. Build Frontend

Start the first terminal and start the frontend service:

```shell
# Enter the remote application container's shell
lzc-cli project devshell

# After entering container shell
cd ui
npm install
npm run dev
```

2. Build Backend

Start the second terminal and start the backend service:

```shell
lzc-cli project devshell

# After entering container shell
cd backend
pip install -r requirements.txt --break-system-packages
python main.py
```

3. Start Application

After the frontend and backend services are running, click the launcher icon to see the todo list application in action.

## Build Application
The knowledge explained earlier requires developers to manually start application services locally or in LCMD before the application can run normally. However, every time LCMD is restarted, you need to execute the build commands again, which is very inconvenient.

Below, we will teach you to build your first application installation package. Through the installation package, we can install the application into LCMD. Every time you click the launcher application icon, the application's frontend and backend services will automatically start.

::: warning
If you are building on Windows, the following step depends on unix shell like git bash

You can also modify the content of build.sh to syntax supported by powershell/cmd
:::

1. Build Application

First, we need to build our application through lzc-cli to output an lpk file:

```shell
# Install application npm dependencies locally
cd ui # Enter interface directory
npm install # Install frontend dependency packages
cd .. # Return to project root directory

# Build lpk
lzc-cli project build -o release.lpk
```

2. Install Application

Install to LCMD MicroServer with the following command:
```shell
lzc-cli app install release.lpk
```

::: info
If you have been installing for a long time and it is still not completed, it may be that the network access to `Tsinghua` and `USTC` mirrors in your area is not smooth, and you need to modify it yourself.

Edit: backend/run.sh and change `mirrors.ustc.edu.cn` or `tuna.tsinghua.edu.cn` inside to the best one in your area.
:::


After installing the application package, you can click the application icon through the launcher. Our first application is deployed like this. Isn't it very rewarding?

::: tip
> lpk packages can be installed through lzc-cli commands, and you can also upload the installation package to LCMD Cloud Drive and double-click to install
:::
