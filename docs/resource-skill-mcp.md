# Skill / MCP 规范

本文说明两件事：

1. 小龙猫、Codex 等 agent 如何接入微服里的 Skill / MCP。
2. 应用如何向微服提供自己的 Skill / MCP。

## 给 agent 接入 Skill / MCP

应用要读取微服里的 Skill / MCP，先在 [`package.yml#import_resources`](./spec/package.md#import_resources) 中导入这两类资源：

```yml
import_resources:
  - kind: skills
  - kind: mcp-providers
```

运行时，agent 直接读取：

```text
/lzcapp/run/resources/skills/
/lzcapp/run/resources/mcp-providers/
```

在微服里，agent 接入 Skill / MCP 的起点是系统内置的：

```text
lazycat-local-resource.skill
```

它会和其他 Skill 一样，出现在：

```text
/lzcapp/run/resources/skills/*/lazycat-local-resource.skill/SKILL.md
```

agent 只需要在 `skills` 目录里找到这份 `SKILL.md` 并优先读取它。

这份 Skill 负责告诉 agent：

1. 当前系统里有哪些可用的 Skill。
2. 当前系统里有哪些可用的 MCP provider。
3. Skill 到哪里读取。
4. MCP provider 的地址如何拼出来。

因此，agent 的接入方式应当是：

1. 先加载 `lazycat-local-resource.skill`。
2. 按它给出的规则发现可用 Skill。
3. 按它给出的规则发现可用 MCP provider。
4. 对 Skill 直接读取 `SKILL.md`。
5. 对 MCP provider 读取 `mcp.yml` 并连接对应地址。

重点不是手工理解目录布局，而是先把这份系统内置 Skill 接给 agent。

Skill 的使用方式到这里就结束了。agent 发现某个 Skill 后，直接读取对应的 `SKILL.md` 即可。Skill 的通用形式可参考 OpenAI 官方的 [Agent Skills](https://developers.openai.com/codex/skills)。

## 使用现有 MCP

MCP 的重点只有两件事：

1. 怎么知道 server 地址。
2. 怎么鉴权。

### 怎么知道地址

每个 MCP provider 都带有：

```text
mcp.yml
```

其中最关键的字段是：

```yml
endpoint: /mcp
```

agent 读取 `endpoint` 后，按 [`.lzcx` 应用间访问规则](./advanced-app-interconnect.md) 拼出完整地址：

```text
http://app.<应用包名>.lzcx<endpoint>
```

例如：

```yml
endpoint: /mcp?view=default
```

对应：

```text
http://app.cloud.lazycat.app.todo.lzcx/mcp?view=default
```

agent 不需要猜测 host、端口或路由方式，只需要读取 `mcp.yml` 并组合 `.lzcx` 地址。

如果当前环境无法解析 `app.<应用包名>.lzcx`，可以直接连接网关 IP，但请求的 `Host` 仍必须保持为 `app.<应用包名>.lzcx`：

```text
URL:  http://172.18.0.1<endpoint>
Host: app.<应用包名>.lzcx
```

也可以通过当前微服的外部域名访问：

```text
https://<应用外部域名>.heiyu.space<endpoint>
```

其中 `<应用外部域名>.heiyu.space` 是目标应用在当前微服上的外部访问域名。MCP 的通用形式可参考官方的 [Model Context Protocol](https://modelcontextprotocol.io/specification/draft) 以及 OpenAI 的 [Codex MCP](https://developers.openai.com/codex/mcp)。

### 怎么鉴权

MCP 访问直接复用微服现有的应用间访问方式。

访问其他应用提供的 MCP 时：

1. 在 `package.yml` 里声明 `lzcapp.user_delegate`。
2. 从真实用户请求里取得 `X-HC-USER-TICKET`。
3. 带着这个票据访问 `http://app.<应用包名>.lzcx<endpoint>`。

完整约定见 [应用间访问](./advanced-app-interconnect.md)。

## 如何制作一个提供 Skill / MCP 的 LPK

下面示例展示一个同时提供 Skill 与 MCP 的 LPK 项目最小写法。

目录结构：

```text
demo-app/
  package.yml
  lzc-build.yml
  resources/
    skills/
      todo-assistant/
        SKILL.md
    mcp-providers/
      default/
        mcp.yml
```

`package.yml`：

```yml
package: cloud.lazycat.app.demo
version: 0.0.1
name: Demo App
```

`lzc-build.yml`：

```yml
resource_exports:
  - kind: skills
    source: ./resources/skills
  - kind: mcp-providers
    source: ./resources/mcp-providers
```

### 提供 Skill

应用提供 Skill 时，入口文件是：

```text
SKILL.md
```

`SKILL.md` 直接写给 agent。写法可参考 OpenAI 官方的 [Agent Skills](https://developers.openai.com/codex/skills)。内容应当清楚说明：

1. 这个 Skill 解决什么问题。
2. agent 进入后先做什么。
3. 需要读取哪些文件。
4. 需要连接哪些服务。

最小示例：

```md
---
name: todo-assistant
description: Read the Todo app data files and help the user summarize and organize tasks.
---

1. Read the task data files first.
2. Summarize the current task list.
3. If the user asks to modify data, call the app's MCP server.
```

### 提供 MCP

应用提供 MCP 时，入口文件是：

```text
mcp.yml
```

最小内容如下：

```yml
endpoint: /mcp?view=default
```

应用自身负责在这个 HTTP 入口上提供 MCP 服务。协议与接入方式可参考 [Model Context Protocol](https://modelcontextprotocol.io/specification/draft) 和 OpenAI 的 [Codex MCP](https://developers.openai.com/codex/mcp)。

如果当前应用包名是 `cloud.lazycat.app.demo`，那么这个 MCP 对外地址就是：

```text
http://app.cloud.lazycat.app.demo.lzcx/mcp?view=default
```

## 相关文档

1. [应用间访问](./advanced-app-interconnect.md)
2. [package.yml#import_resources](./spec/package.md#import_resources)
3. [构建规范 `resource_exports`](./spec/build.md#resource-exports)
