# lzc-build.yml Specification Document

## 1. Overview

`lzc-build.yml` is a file used to define application build-related configurations. This document will describe its structure and the meaning of each field in detail.

## 2. Top-level Data Structure `BuildConfig`

### 2.1 Basic Information {#basic-config}

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `buildscript` | `string` | Can be the path to the build script or sh command |
| `manifest` | `string` | Specifies the path to the manifest.yml file for the lpk package |
| `contentdir` | `string` | Specifies the content directory to be packaged, which will be packaged into the lpk |
| `pkgout` | `string` | Specifies the output path for the lpk package |
| `icon` | `string` | Specifies the path to the lpk package icon, a warning will be shown if not specified, currently only PNG format files are allowed |
| `devshell` | `DevshellConfig` | Development dependency configuration |
| `compose_override` | `ComposeOverrideConfig` | Advanced compose override configuration, **requires lzc-os version >= v1.3.0** |

## 3. Development Dependencies `DevshellConfig` {#devshell}

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `routes` | `[]string` | Development routing rule configuration |
| `dependencies` | `[]string` | Development dependency installation, automatic installation |
| `setupscript` | `string` | Development dependency installation, manual installation |
| `image` | `string` | Optional, use specified image |
| `pull_policy` | `string` | Optional, parameter `build` is to use specified dockerfile to build image, at this time the image parameter can be filled with `${package}-devshell:${version}` |
| `build` | `string` | Optional, the dockerfile file path used when building the container |

For details, see [Development Dependency Installation](../devshell-install-and-use.md)

::: warning ⚠️ Note

If `dependencies` and `build` exist at the same time, dependencies will be used first

:::

## 4. Advanced Compose Override Configuration `ComposeOverrideConfig` {#compose-override}

1. Compose override is a feature supported by lzc-cli@1.2.61 and above versions, used to specify compose override configuration during build.
2. Compose override belongs to lzcos v1.3.0+, targeting configurations for runtime permission requirements that the current lpk specification cannot cover.

For details, see [compose override](../advanced-compose-override.md)

::: details Configuration Example
```yml
# Throughout the file, you can use values defined in the file specified by the manifest field through ${var}

# buildscript
# - Can be the path to the build script
# - If the build command is simple, you can also write sh commands directly
buildscript: sh build.sh

# manifest: Specifies the path to the manifest.yml file for the lpk package
manifest: ./lzc-manifest.yml

# contentdir: Specifies the content to be packaged, which will be packaged into the lpk
contentdir: ./dist

# pkgout: Output path for the lpk package
pkgout: ./

# icon specifies the path to the lpk package icon, a warning will be shown if not specified
# icon only allows PNG format files
icon: ./lzc-icon.png

compose_override:
  services:
    # Specify service name
    some_container:
      # Specify caps to drop
      cap_drop:
        - SETCAP
        - MKNOD
      # Specify files to mount
      volumes:
        - /data/playground:/lzcapp/run/playground:ro

# devshell specifies development dependency situation
# In this case, choose alpine:latest as the base image, and add the required development dependencies in dependencies
# If dependencies and build exist at the same time, dependencies will be used first
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
