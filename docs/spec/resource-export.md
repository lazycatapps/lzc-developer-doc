# LPK Resource Export 规范

本文定义 LPK 中静态资源的导出与导入机制。

说明：

1. 本文只定义静态资源的发现、聚合与运行时投影。
2. 本文不定义应用间访问、鉴权、授权、网络路由或资源内容本身的业务语义。
3. 本机制要求 `lzcos >= v1.5.2`。
4. LZCOS 在该机制中只感知 `kind`、`resource id` 与 `payload`，不感知具体资源类型的业务字段。

## 1. 基本概念

### 1.1 Resource Export

LPK 可以导出静态资源，供系统发现、聚合，并在运行时投影给其他 LPK 消费。

每个导出资源由以下三部分组成：

1. `kind`
   - 资源类型。
2. `resource id`
   - 当前 LPK 内该资源的稳定标识。
3. `payload`
   - 资源目录本身的全部文件内容。

### 1.2 Resource Import

LPK 可以在 `package.yml` 中声明希望导入的资源类型。

系统根据导入声明，将对应类型的已安装资源投影到当前 LPK 的运行时目录中。

## 2. LPK 内导出目录

LPK 内所有可导出资源统一放在 `exports/` 下：

```text
.
├── package.yml
└── exports/
    └── <kind>/
        └── <resource-id>/
            └── ...
```

示例：

```text
exports/skills/todo-assistant/SKILL.md
exports/mcp-providers/default/mcp.yml
exports/browser-extensions/ublock-origin/manifest.json
```

规则：

1. `exports/` 是唯一的资源导出根目录。
2. `exports/<kind>/<resource-id>/` 整个目录就是该资源的 `payload`。
3. 系统只感知 `kind`、`resource-id` 与 `payload`。
4. 系统不解析 `payload` 的业务内容。
5. 同一个 LPK 内，`(kind, resource-id)` 必须唯一。
6. 资源的全局唯一身份是 `(package-id, kind, resource-id)`。

## 3. `kind`

`kind` 用于标识资源类型。

规则：

1. 不能为空。
2. 不能以 `.` 开头。
3. 只能使用小写字母、数字、点号、下划线和中划线。

示例：

```text
skills
mcp-providers
browser-extensions
```

## 4. `resource-id`

`resource-id` 是某个 `kind` 下的资源标识。

规则：

1. 不能为空。
2. 不能以 `.` 开头。
3. 只能使用小写字母、数字、点号、下划线和中划线。

## 5. `import_resources`

LPK 通过 `package.yml` 的 `import_resources` 字段声明需要导入的资源类型。

结构如下：

```yml
import_resources:
  - kind: skills
  - kind: mcp-providers
```

规则：

1. `import_resources` 是可选字段。
2. `import_resources` 是一个列表。
3. 当前每个元素只定义一个字段：`kind`。
4. 同一个 `kind` 只能声明一次。
5. 系统只投影已声明的 `kind`。

说明：

1. `import_resources` 只表达“需要哪类资源”。
2. 当前版本不定义过滤条件、投影格式或自定义路径。
3. 后续如需扩展，应在列表项中新增字段，不破坏现有结构。

## 6. 系统聚合

系统对已安装 LPK 的资源执行统一发现与聚合。

规则：

1. 系统扫描每个已安装 LPK 的 `exports/<kind>/<resource-id>/`。
2. 系统按 `(package-id, kind, resource-id)` 建立聚合视图。
3. 系统在安装、卸载、升级后刷新聚合结果。
4. 系统不要求不同 `kind` 共享统一索引文件。
5. 系统不保证为每个 `kind` 提供额外的 catalog 文件。

## 7. 运行时投影

当某个 LPK 声明导入某个 `kind` 时，系统将该 `kind` 的聚合结果只读投影到运行时：

```text
/lzcapp/run/resources/.digest/<kind>/summary
/lzcapp/run/resources/.digest/<kind>/<package-id>/<resource-id>/digest
/lzcapp/run/resources/<kind>/<package-id>/<resource-id>/...
```

示例：

```text
/lzcapp/run/resources/.digest/skills/summary
/lzcapp/run/resources/.digest/skills/cloud.lazycat.app.todo/todo-assistant/digest
/lzcapp/run/resources/skills/cloud.lazycat.app.todo/todo-assistant/SKILL.md
/lzcapp/run/resources/.digest/mcp-providers/summary
/lzcapp/run/resources/.digest/mcp-providers/cloud.lazycat.app.todo/default/digest
/lzcapp/run/resources/mcp-providers/cloud.lazycat.app.todo/default/mcp.yml
/lzcapp/run/resources/.digest/browser-extensions/summary
/lzcapp/run/resources/.digest/browser-extensions/cloud.lazycat.browser.adblock/ublock-origin/digest
/lzcapp/run/resources/browser-extensions/cloud.lazycat.browser.adblock/ublock-origin/manifest.json
```

规则：

1. 运行时资源根目录固定为 `/lzcapp/run/resources/`。
2. 每个 `kind` 独立投影到 `/lzcapp/run/resources/<kind>/`。
3. digest 元数据统一放在 `/lzcapp/run/resources/.digest/<kind>/`。
4. `/lzcapp/run/resources/<kind>/` 下不包含 `.digest/` 目录。
5. `.digest/<kind>/summary` 表示当前 `kind` 聚合结果的整体 digest。
6. `.digest/<kind>/<package-id>/<resource-id>/digest` 表示对应资源 `payload` 的 digest。
7. 当该 `kind` 的聚合结果发生变化时，系统更新 `.digest/<kind>/summary` 与相关资源的单项 digest。
8. 消费方可以通过读取 `.digest/<kind>/summary` 快速判断是否需要进一步检查该 `kind` 的资源变化。
9. 当 `.digest/<kind>/summary` 变化后，消费方可以读取 `.digest/<kind>/<package-id>/<resource-id>/digest` 判断具体哪些资源发生了变化。
10. 运行时目录结构固定为 `<package-id>/<resource-id>/...`。
11. 投影结果是只读目录。
12. 系统不修改 `payload` 内容。
13. 消费方自行解释资源内容。

## 8. 适用范围

本机制适用于以下类型的静态资源：

1. `skills`
2. `mcp-providers`
3. `browser-extensions`

说明：

1. 上述 `kind` 仅作为示例，不构成完整列表。
2. 后续新增资源类型时，优先复用本机制。
