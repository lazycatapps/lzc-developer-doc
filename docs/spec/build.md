# lzc-build.yml 规范文档

## 一、 概述

`lzc-build.yml` 是用于定义应用构建相关配置的文件。 本文档将详细描述其结构和各字段的含义。

## 二、字段说明
### 2.1 基本信息 {#basic-config}

| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `buildscript` | 脚本 | 可以为构建脚本的路径地址或者 sh 的命令 |
| `manifest` | 文件 | 指定 lpk 包的 manifest.yml 文件路径 |
| `contentdir` | 目录 | 指定打包的内容，将会打包到 lpk 中 |
| `pkgout` | 目录 | 指定 lpk 包的输出路径 |
| `icon` | 文件 | 指定 lpk 包 icon 的路径路径，如果不指定将会警告， 仅允许 png 后缀的文件 |

### 2.2 开发依赖 {#devshell}
| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `devshell` | 对象 | 指定开发依赖的情况 |
| `routes` | 数组 | 指定开发依赖的情况 |
| `dependencies` | 数组 | 指定开发依赖的情况 |
| `setupscript` | 脚本 | 指定开发依赖的情况 |

### 2.3 compose override 说明

1. compose override 是 lzc-cli@1.2.61 及以上版本支持的特性， 用于在构建时指定 compose override 的配置。
2. compose override 属于 lzcos v1.3.0+ 后，针对一些 lpk 规范目前无法覆盖到的运行权限需求的配置。

详情见 [compose override](../advanced-compose-override.md)




::: details 配置示例
```yml
# 整个文件中，可以通过 ${var} 的方式，使用 manifest 字段指定的文件定义的值

# buildscript
# - 可以为构建脚本的路径地址
# - 如果构建命令简单，也可以直接写 sh 的命令
buildscript: sh build.sh

# manifest: 指定 lpk 包的 manifest.yml 文件路径
manifest: ./lzc-manifest.yml

# contentdir: 指定打包的内容，将会打包到 lpk 中
contentdir: ./dist

# pkgout: lpk 包的输出路径
pkgout: ./

# icon 指定 lpk 包 icon 的路径路径，如果不指定将会警告
# icon 仅仅允许 png 后缀的文件
icon: ./lzc-icon.png

# dvshell 指定开发依赖的情况
# 这种情况下，选用 alpine:latest 作为基础镜像，在 dependencies 中添加所需要的开发依赖即可
# 如果 dependencies 和 build 同时存在，将会优先使用 dependencies
devshell:
  routes:
    - /=http://127.0.0.1:5173
  dependencies:
    - nodejs
    - npm
    - python3
    - py3-pip
  setupscript: |
    export npm_config_registry=https://registry.npmmirror.com
    export PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
```
:::
