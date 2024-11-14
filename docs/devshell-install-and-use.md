# 软件安装和指定镜像

## 在基础镜像安装软件

我们开发中经常需要安装一些自己所需要的工具,例如 python,pip,unzip,可以执行下面命令

```bash
apk add python3 py3-pip unzip
```

这里用`apk`去安装是因为 devshell 使用的镜像是`alpine`,这个是它的默认包管理工具

### 如果我不想每次devshell都要手动安装怎么办呢?

有下面两种方式可以实现
- 在 lzc-build.yml 配置`setupscript`字段,每次进入devshell都会帮你执行!

```yml
devshell:
  setupscript: |
    apk add python3 py3-pip unzip
```

- 在 lzc-build.yml 配置`dependencies`字段,它会自动帮你安装指定的依赖

```yml
devshell:
  dependencies:
    - python3
    - py3-pip
    - unzip
```

## 指定镜像
还有一种方法是可以直接指定想要的docker镜像,这样子就不必去配置环境了

例如下面指定 Go 的环境:
``` yml
devshell:
  image: registry.lazycat.cloud/golang:1.21.0-alpine3.18
```



---
tip: 指定`image`之后`dependencies`会失效

