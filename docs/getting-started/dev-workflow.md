# 新开发模式总览 {#dev-workflow}

新版 `lzc-cli` 推荐统一按下面的模型理解应用开发：

1. 前端开发：`lzc-build.dev.yml + request inject + 开发机 dev server`
2. 后端开发：`lzc-build.dev.yml + request inject + project sync --watch`
3. 发布：`lzc-build.yml + 最终产物镜像`

## 1. 四个关键文件 {#three-files}

典型项目建议只维护这四类文件：

1. `lzc-manifest.yml`
2. `package.yml`
3. `lzc-build.yml`
4. `lzc-build.dev.yml`

角色分工：

1. `lzc-manifest.yml`
   - 描述应用本身的稳定结构。
   - dev 特有逻辑通过 `#@build` 预处理块启用或裁剪。
2. `package.yml`
   - 静态包元数据。
3. `lzc-build.yml`
   - release 构建配置。
4. `lzc-build.dev.yml`
   - 开发态覆盖配置，只放相对 release 的差异。

常见 dev 配置：

```yml
pkg_id_suffix: dev

envs:
  - DEV_MODE=1

images:
  app-runtime:
    context: ./
    dockerfile: ./Dockerfile.dev
```

这里最关键的是：

1. `pkg_id_suffix: dev`
   - 保证开发部署不会覆盖正式安装包。
2. `envs`
   - 只在构建阶段生效。
   - 会注入 `buildscript`。
   - 可在 `#@build if env.DEV_MODE=1` 中使用。
3. `images`
   - dev 和 release 可以使用不同镜像来源或 alias。

## 2. `project` 命令默认行为 {#project-defaults}

只要项目中存在 `lzc-build.dev.yml`，以下命令默认优先使用它：

1. `lzc-cli project deploy`
2. `lzc-cli project info`
3. `lzc-cli project start`
4. `lzc-cli project exec`
5. `lzc-cli project cp`
6. `lzc-cli project sync`
7. `lzc-cli project log`

每个命令都会打印实际使用的 `Build config`。

如果要显式操作 release：

```bash
lzc-cli project deploy --release
lzc-cli project info --release
```

`project release` 始终使用 `lzc-build.yml`。

## 3. 只在 dev 模式下启用 request inject {#dev-only}

推荐把 dev 专属 inject 放进 manifest build 预处理块，而不是放到部署阶段 render：

```yml
application:
  routes:
    - /=file:///lzcapp/pkg/content/dist
#@build if env.DEV_MODE=1
  injects:
    - id: frontend-dev-proxy
      on: request
      when:
        - "/*"
      do:
        - src: |
            // dev-only request inject
#@build end
```

这样 release 包里物理上就不会带这段 dev inject。

## 4. 前端开发流 {#frontend-dev}

推荐顺序：

1. `lzc-cli project deploy`
2. `lzc-cli project info`
3. 先打开应用
4. 再执行 `npm run dev`

推荐先打开应用，而不是一开始就跑 `npm run dev`，原因是：

1. 页面会明确告诉你当前是否已经关联到开发机。
2. 页面会显示 inject 实际等待的端口。
3. 如果开发机不在线或未同步 `dev.id`，页面会直接给出下一步引导。

## 5. 后端开发流 {#backend-dev}

后端模板同样建议先部署、先打开应用：

1. `lzc-cli project deploy`
2. `lzc-cli project info`
3. 先打开应用
4. 如果后端未就绪，页面会直接提示下一步
5. 再执行代码同步与进程启动

推荐环路：

```bash
lzc-cli project sync --watch
lzc-cli project exec /bin/sh
# inside container
/app/run.sh
```

当前模板建议：

1. `golang`
   - dev 模式下不自动启动，开发者手动构建/启动。
2. `springboot`
   - dev 模式下不自动启动。
3. `python`
   - dev 模式下会额外启动一个 `backend` service，并由 request inject 把入口流量代理到该 service。
   - `backend` service 直接执行 `/app/run.sh`，因此应用页面通常会自动进入业务页；如果后端还没 ready，仍会先显示引导页。

## 6. 发布流 {#release-workflow}

release 建议保持最小、稳定、无开发期副作用：

1. 使用 `lzc-build.yml`
2. 不带 `pkg_id_suffix`
3. 不启用 dev-only `#@build` 分支
4. 镜像只包含最终产物
5. 若 release 不需要静态文件目录，可省略 `contentdir`

发布命令：

```bash
lzc-cli project release -o app.lpk
```
