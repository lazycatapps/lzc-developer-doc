# Development Dependency Installation

When developing applications, we need to install some software or dependencies required for development in LCMD in advance, such as python, pip, unzip, etc.

There are 4 installation methods for you to choose from:

## devshell Manual Installation
After entering the LCMD application container through devshell, you can directly execute commands to install

```bash
apk add python3 py3-pip unzip
```

Because LCMD uses the `alpine` image, you need to use `alpine`'s default package management tool `apk` to install software.


### Define setupscript Installation Commands for Automatic Installation

- Configure the `setupscript` field in lzc-build.yml. Every time you enter devshell, it will help you execute the script after the `setupscript` field

```yml
devshell:
  setupscript:
    apk add python3 py3-pip unzip
```


### Define dependencies for Automatic Dependency Installation
- Configure the `dependencies` field in lzc-build.yml, it will automatically help you install the specified dependencies

```yml
devshell:
  dependencies:
    - python3
    - py3-pip
    - unzip
```


## Define Docker Image
- Configure the `image` field in lzc-build.yml, it will automatically download the docker image

For example, specify the Go environment below:
``` yml
devshell:
  image: registry.lazycat.cloud/golang:1.21.0-alpine3.18
```



---
tip: After specifying `image`, `dependencies` will become invalid

