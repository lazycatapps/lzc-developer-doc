# compose override

lzcos v1.3.0+ 后，针对一些 lpk 规范目前无法覆盖到的运行权限需求，
可以通过 [compose override](https://docs.docker.com/reference/compose-file/merge/) 机制来间接实现。

override 属于过渡阶段机制，针对一些可控的权限会逐步在 lpk 规范中进行支持，并在安装应用时由管理员进行决策。
override 机制的兼容性不受支持，特别是 volumes 挂载系统内部文件路径。

::: warning

如果有使用到此机制请在开发者群进行说明或通过 [联系我们](https://lazycat.cloud/about?navtype=AfterSalesService) 找到客服联系开发者服务，官方会记录，以便在可能破坏兼容性前与开发者进行沟通，否则提交应用商店审核可能会被拒绝。

:::

# 使用方式

在 lpk 文件根目录(不是工程项目根目录)下按照 `compose override` 规范放置一个名字为 `compose.override.yml` 的文件即可。

此外，lzc-build.yml 文件的 `compose_override` 字段的所有内容会自动写入到 `lpk/compoe.override.yml` (该功能仅 lzc-cli@1.2.61 及以上版本可用)。

比如
```yml
pkgout: ./
icon: ./lazycat.png
contentdir: ./dist/

compose_override:
  services:
    # 指定服务名称
    some_container:
      # 指定需要 drop 的 cap
      cap_drop:
        - SETCAP
        - MKNOD
      # 指定需要挂载的文件
      volumes:
        - /data/playground:/lzcapp/run/playground:ro
```


::: tip 文件挂载

1. 挂载宿主系统的文件时，尽量不要挂载/lzcsys/相关的文件，这里的布局属于lzcos内部细节后续版本很可能会变动。
2. docker-compose里挂载文件的关键字是`volumes`，注意不要写成lzc-manifest.yml中的`binds`。(binds的语义和volumes有很大区别，所以故意不使用一致的名字)

:::
