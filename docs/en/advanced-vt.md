# Physical Display Applications

## Goal {#goal}

After VT display is enabled for an lzcapp, the application can output a Linux console, Xorg, LightDM, or another local graphical interface to a physical display connected to the Lazycat Microserver. The application can also check whether its display is active and activate it when needed.

VT display is intended for applications that directly use a physical display connected to the Lazycat Microserver. Applications that provide their interface only through a browser, VNC, or remote desktop do not need this feature.

## Prerequisites {#prerequisites}

1. The Lazycat Microserver must run lzcos v1.6.1 or later.
2. The application must declare the `vt.display` permission.
3. Set `application.vt: true` when the lzcapp itself needs to use a physical display.
4. Every service in the application must use the default `runc` runtime. VT display does not support `sysbox-runc`.
5. The display program inside the application must support output through a Linux virtual terminal.

VT provides the application's virtual terminal display capability only. If Xorg, a desktop environment, or another graphical program also requires GPU access, configure [GPU Acceleration](./advanced-gpu.md) separately.

## Configure the Application {#configure-app}

Declare the `vt.display` permission in `package.yml`:

```yml
package: cloud.lazycat.app.display-demo
version: 0.0.1
name: Display Demo

permissions:
  required:
    - vt.display
```

Enable the application VT in `lzc-manifest.yml`:

```yml
application:
  subdomain: display-demo
  vt: true
```

After the application starts, `app` and every service declared under `services` share the same application display. Each service can access that display through either of these paths:

- `/dev/tty0`
- `/dev/tty7`

Applications should use only these two compatibility paths. Do not access or retain any other `/dev/ttyN` number.

Enabling VT makes a display available to the application, but does not guarantee that the physical display is currently showing it. Run `/lzcinit/vt.active activate` when the application needs to show its interface.

## System VT Allocation {#system-vt-allocation}

The Lazycat Microserver manages local virtual terminals from `tty0` through `tty63` as follows:

| Host terminal | Purpose |
| ---- | ---- |
| `tty0` | System entry for the currently active VT; it is not an independently allocatable terminal |
| `tty1` | System VT selection screen, accessible with `Ctrl+Alt+F1` |
| `tty2` through `tty6` | Local text login terminals |
| `tty7` through `tty8` | Dynamic allocation pool for physical display applications |
| `tty9` | Reserved by the system and never allocated to applications |
| `tty10` through `tty63` | Dynamic allocation pool for physical display applications |

Each time an application starts, the system selects an available terminal from the dynamic pool. The terminal is released when the application stops. An application may receive a different host VT number after it restarts, so do not depend on or retain the `ttyN` shown by `hc vt list`.

These numbers describe host system terminals. Inside an application service, `/dev/tty0` and `/dev/tty7` are compatibility paths for accessing that application's display. They do not mean that the application occupies host `tty0` or `tty7`.

## Query the Active State {#query-active-state}

When both `vt.display` and `application.vt: true` are configured, every service can use `/lzcinit/vt.active` to check whether the physical display is currently showing this application:

```bash
/lzcinit/vt.active status
```

Running the command without arguments performs the same status query:

```bash
/lzcinit/vt.active
```

The command returns the following results:

| State | Standard output | Exit code |
| ---- | ---- | ---- |
| This application's display is active | `active` | `0` |
| This application's display is inactive | `inactive` | `1` |
| The query failed | Error message on standard error | `2` |

Exit code `1` means the query succeeded but the application is not currently visible. It does not indicate an interface failure.

A shell script can handle the exit code directly:

```bash
/lzcinit/vt.active status
case $? in
  0) echo "The application display is active." ;;
  1) echo "The application display is inactive." ;;
  2) echo "Unable to query the application display." >&2 ;;
esac
```

## Activate the Application Display {#activate-display}

Run the following command to switch the physical display to this application:

```bash
/lzcinit/vt.active activate
```

The command returns successfully after the application display is active. It does not accept a VT number or another application identifier and can activate only the lzcapp that invokes it.

## Switch Displays with a Keyboard {#switch-with-keyboard}

Press `Ctrl+Alt+F1` on a physical keyboard connected to the Lazycat Microserver to return to the system VT selection screen. Use the arrow keys to select an application and press Enter to switch to it.

The system assigns each application's VT number dynamically. Do not use other function-key combinations such as `Ctrl+Alt+F2` to switch directly to an application.

## Debug with hc {#debug-with-hc}

After connecting to the Lazycat Microserver through SSH, use `hc vt` to inspect and switch between the currently available VT displays.

List the current displays:

```bash
hc vt list
```

Each line in the output is a switch command that can be run directly, for example:

```text
hc vt switch 1 # lzcos:placeholder tty=1 active
hc vt switch 2 # cloud.lazycat.app.display-demo:app tty=7
```

Switch to display number `2`:

```bash
hc vt switch 2
```

The number is the position in the current `hc vt list` output. The list may change when applications start or stop, so run `hc vt list` again before switching.

## Verify {#verify}

1. Install and start the application.
2. Run `/lzcinit/vt.active status` in any service.
3. Run `/lzcinit/vt.active activate`.
4. Run `/lzcinit/vt.active status` again and confirm that it prints `active` and exits with code `0`.
5. Confirm that the physical display shows the application's output.
6. Press `Ctrl+Alt+F1` on a physical keyboard and confirm that the system VT selection screen appears.
7. Run `hc vt list` through SSH, then run a displayed `hc vt switch <number>` command and confirm that the application display appears again.

## Common Errors {#common-errors}

### Installation Reports a Missing `vt.display` Permission {#missing-permission}

Check whether `package.yml` declares the permission:

```yml
permissions:
  required:
    - vt.display
```

Setting only `application.vt: true` does not grant the permission automatically.

### `sysbox-runc` Is Not Supported for VT {#sysbox-not-supported}

An application with `application.vt` enabled cannot contain a service that uses `runtime: sysbox-runc`. Make sure all services use the default runtime.

### `/lzcinit/vt.active` Is Missing {#helper-not-found}

Check that the application meets both requirements:

1. `package.yml` declares `vt.display`.
2. `lzc-manifest.yml` sets `application.vt: true`.

Declaring the permission without enabling VT for the lzcapp itself does not provide this command.
