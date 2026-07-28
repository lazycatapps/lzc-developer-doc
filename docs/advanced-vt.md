# 物理显示器应用

## 目标 {#goal}

为 lzcapp 启用 VT 显示后，应用可以把 Linux 控制台、Xorg、LightDM 等本地图形界面输出到与微服连接的物理显示器，并在应用内查询或激活自己的显示界面。

VT 显示适用于需要直接使用微服物理显示器的应用。仅通过浏览器、VNC 或远程桌面提供界面的应用不需要启用此功能。

## 前置条件 {#prerequisites}

1. 微服需运行 lzcos v1.6.1 或更高版本。
2. 应用必须声明 `vt.display` 权限。
3. 应用自身需要使用物理显示器时，必须设置 `application.vt: true`。
4. 应用中的所有 service 都必须使用默认的 `runc` runtime。VT 显示不支持 `sysbox-runc`。
5. 应用内的显示程序需要支持通过 Linux 虚拟终端输出。

VT 只提供应用的虚拟终端显示能力。如果 Xorg、桌面环境或其他图形程序还需要访问 GPU，请另外配置 [GPU 加速](./advanced-gpu.md)。

## 配置应用 {#configure-app}

在 `package.yml` 中声明 `vt.display` 权限：

```yml
package: cloud.lazycat.app.display-demo
version: 0.0.1
name: Display Demo

permissions:
  required:
    - vt.display
```

在 `lzc-manifest.yml` 中启用应用 VT：

```yml
application:
  subdomain: display-demo
  vt: true
```

应用启动后，`app` 和 `services` 中声明的所有 service 共享同一个应用显示界面。应用内可以使用以下任一路径访问该界面：

- `/dev/tty0`
- `/dev/tty7`

应用只应使用这两个兼容路径，不要访问或保存其他 `/dev/ttyN` 编号。

启用 VT 只为应用提供可用的显示界面，不表示该界面始终是物理显示器当前显示的内容。需要主动显示应用界面时，请使用 `/lzcinit/vt.active activate`。

## 系统 VT 分配规则 {#system-vt-allocation}

微服使用 `tty0` 到 `tty63` 管理本地虚拟终端，各编号的用途如下：

| 宿主终端 | 用途 |
| ---- | ---- |
| `tty0` | 当前活动 VT 的系统入口，不是独立的可分配终端 |
| `tty1` | 系统 VT 选择界面，可通过 `Ctrl+Alt+F1` 返回 |
| `tty2` 至 `tty6` | 本地文本登录终端 |
| `tty7` 至 `tty8` | 物理显示器应用的动态分配池 |
| `tty9` | 系统保留终端，不分配给应用 |
| `tty10` 至 `tty63` | 物理显示器应用的动态分配池 |

应用每次启动时由系统从动态分配池中选择可用终端，停止后释放。应用重新启动时可能获得不同的宿主 VT 编号，因此不能依赖或保存 `hc vt list` 中显示的 `ttyN`。

上述编号描述的是宿主系统终端。应用 service 内的 `/dev/tty0` 和 `/dev/tty7` 是访问本应用显示界面的兼容路径，不表示应用实际占用了宿主 `tty0` 或 `tty7`。

## 查询激活状态 {#query-active-state}

同时声明 `vt.display` 和 `application.vt: true` 后，每个 service 都可以通过 `/lzcinit/vt.active` 查询当前物理显示器是否正在显示本应用界面：

```bash
/lzcinit/vt.active status
```

不带参数时同样执行状态查询：

```bash
/lzcinit/vt.active
```

命令结果如下：

| 状态 | 标准输出 | 退出码 |
| ---- | ---- | ---- |
| 本应用界面已激活 | `active` | `0` |
| 本应用界面未激活 | `inactive` | `1` |
| 查询失败 | 错误信息写入标准错误 | `2` |

退出码 `1` 表示查询成功但应用当前不可见，不应当作接口故障处理。

Shell 脚本可以直接根据退出码处理：

```bash
/lzcinit/vt.active status
case $? in
  0) echo "The application display is active." ;;
  1) echo "The application display is inactive." ;;
  2) echo "Unable to query the application display." >&2 ;;
esac
```

## 激活应用界面 {#activate-display}

需要把物理显示器切换到本应用界面时执行：

```bash
/lzcinit/vt.active activate
```

命令会在应用界面实际激活后成功返回。该命令不接受 VT 编号或其他应用标识，只能激活调用方所属 lzcapp 的界面。

## 使用键盘切换界面 {#switch-with-keyboard}

在连接到微服的物理键盘上按 `Ctrl+Alt+F1`，可以返回系统 VT 选择界面。使用方向键选择需要显示的应用，按回车键确认切换。

应用获得的 VT 编号由系统分配，不要使用 `Ctrl+Alt+F2` 等其他功能键直接切换到指定应用。

## 使用 hc 调试 {#debug-with-hc}

通过 SSH 登录微服后，可以使用 `hc vt` 查看和切换当前可用的 VT 界面。

列出当前界面：

```bash
hc vt list
```

输出中的每一行都是可直接执行的切换命令，例如：

```text
hc vt switch 1 # lzcos:placeholder tty=1 active
hc vt switch 2 # cloud.lazycat.app.display-demo:app tty=7
```

切换到编号为 `2` 的界面：

```bash
hc vt switch 2
```

编号表示本次 `hc vt list` 中的位置。应用启动或停止后列表可能变化，每次切换前应重新执行 `hc vt list`。

## 验证 {#verify}

1. 安装并启动应用。
2. 在任一 service 中执行 `/lzcinit/vt.active status`。
3. 执行 `/lzcinit/vt.active activate`。
4. 再次执行 `/lzcinit/vt.active status`，确认输出为 `active`，退出码为 `0`。
5. 确认物理显示器正在显示应用输出的界面。
6. 在物理键盘上按 `Ctrl+Alt+F1`，确认可以返回系统 VT 选择界面。
7. 通过 SSH 执行 `hc vt list`，再执行输出中的 `hc vt switch <number>`，确认可以切换回应用界面。

## 常见错误 {#common-errors}

### 安装时提示缺少 `vt.display` {#missing-permission}

检查 `package.yml` 是否声明了权限：

```yml
permissions:
  required:
    - vt.display
```

仅设置 `application.vt: true` 不会自动获得该权限。

### 提示 `sysbox-runc` 不支持 VT {#sysbox-not-supported}

启用 `application.vt` 的应用不能包含 `runtime: sysbox-runc` 的 service。请确认相关 service 使用默认 runtime。

### 找不到 `/lzcinit/vt.active` {#helper-not-found}

检查应用是否同时满足以下两个条件：

1. `package.yml` 声明了 `vt.display`。
2. `lzc-manifest.yml` 设置了 `application.vt: true`。

只声明权限但未为 lzcapp 本身启用 VT 时，不会提供该命令。
