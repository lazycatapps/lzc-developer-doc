# First Golang Application
We have just learned to develop LCMD MicroServer applications with Python. Actually, the directory structure of Golang applications is exactly the same as Python applications.

## Download Application Source Code
```shell
https://gitee.com/lazycatcloud/todolist-go-lzcapp-demo.git
```

## Package and Install Application

::: warning
If you are building on Windows, the following step depends on unix shell like git bash

You can also modify the content of build.sh to syntax supported by powershell/cmd
:::

```shell
# Install application npm dependencies locally
cd ui # Enter interface directory
npm install # Install frontend dependency packages
cd .. # Return to project root directory

# Build lpk
lzc-cli project build -o release.lpk

# Install lpk
lzc-cli app install release.lpk
```
