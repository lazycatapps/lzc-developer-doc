# package.yml 规范文档

## 一、概述

`package.yml` 用于定义 LPK 的静态包元数据。

自 LPK v2 起，以下字段应统一放在 `package.yml`，不再写到 `lzc-manifest.yml` 顶层：

1. `package`
2. `version`
3. `name`
4. `description`
5. `author`
6. `license`
7. `homepage`
8. `admin_only`
9. `min_os_version`
10. `unsupported_platforms`
11. `locales`

## 二、顶层数据结构 `PackageConfig`

| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `package` | `string` | 必填；应用唯一包 ID，需满足合法 package name 规则 |
| `version` | `string` | 必填；应用版本 |
| `name` | `string` | 可选；应用名称 |
| `description` | `string` | 可选；应用描述 |
| `author` | `string` | 可选；作者或维护者 |
| `license` | `string` | 可选；许可证标识或链接 |
| `homepage` | `string` | 可选；主页或反馈地址 |
| `admin_only` | `bool` | 可选；是否仅管理员可见 |
| `min_os_version` | `string` | 可选；要求的最低系统版本 |
| `unsupported_platforms` | `[]string` | 可选；不支持的平台列表 |
| `locales` | `map[string]PackageLocaleConfig` | 可选；多语言元数据 |

说明：

1. `package` 与 `version` 是最小必填字段。
2. `package` 是唯一包 ID，`application.subdomain` 是默认访问域名，两者语义不同。
3. 构建阶段若在 `lzc-build.yml` 里设置 `pkg_id` / `pkg_name`，会覆盖最终写入 `package.yml` 的 `package` / `name`。

## 三、`locales`

`locales` 用于声明多语言元数据。

| 字段名 | 类型 | 描述 |
| ---- | ---- | ---- |
| `name` | `string` | 当前语言下的应用名称 |
| `description` | `string` | 当前语言下的应用描述 |

约束：

1. `locales` 的 key 建议使用 BCP 47 语言标签，例如 `zh-CN`、`en-US`。
2. `locales.<lang>.name` 与 `locales.<lang>.description` 都是可选字段。
3. 未命中某个语言时，系统回退到顶层 `name` / `description`。

## 四、最小示例

```yml
package: cloud.lazycat.app.demo-app
version: 0.0.1
name: Demo App
description: Demo application
```

## 五、完整示例

```yml
package: cloud.lazycat.app.demo-app
version: 0.0.1
name: Demo App
description: Demo application
author: Demo Team
license: MIT
homepage: https://example.com
min_os_version: 1.2.3
unsupported_platforms:
  - linux/386
locales:
  zh-CN:
    name: 示例应用
    description: 示例应用描述
  en-US:
    name: Demo App
    description: Demo application
```
