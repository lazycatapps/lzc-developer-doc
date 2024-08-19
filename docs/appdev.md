# 应用开发

::: info
介绍以下内容
  1. 访问 `lpk` 包中的资源
  2. 定义访问路由
  3. 持久化数据
  4. 添加其他 sidecar 服务，如 `mysql`, `redis` 等 sidecar 服务
:::

::: tip
点击右侧导航栏，快速跳转
:::

::: tip
如果你是有经验的开发者，可以直接查看 [manifest](https://gitee.com/linakesi/lzc-sdk/blob/master/docs/manifest.yml) 的字段说明
:::

## 1. 访问 `lpk` 包中的资源

`lpk` 的微服应用的安装包，里面有应用所需要的各种文件（比如前端界面的构建dist目录，后端运行的二进制文件等）。资源文件是在 `lzc-build.yml` 中的 `contentdir` 的定义，在构建的时候，你可以将需要携带的资源文件放在这个目录下，构建完成后，会把里面的资源文件打包到 `lpk` 中。

在一个应用安装完成后
