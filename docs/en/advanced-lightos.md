# LightOS Scenarios

LightOS is for cases where you need to maintain a complete Linux runtime environment over time. It is not a replacement for LPK: LPK is for packaging an app as a distributable and reproducible one-click install package; LightOS is for users or management apps that need to maintain an instance closer to a system environment.

## When To Use LightOS {#when-to-use-lightos}

Use LightOS when your requirement matches any of these cases:

1. You need to install software with a package manager and keep it after restart.
2. You need to persist system-level configuration, development toolchains, scripts, service processes, or debugging environments.
3. You need a complete Linux environment that can be entered with a shell, instead of only running a packaged lzcapp.
4. You need to turn commands, configuration, or tools tested over SSH into a long-lived environment.

Do not use LightOS as the default distribution format for normal apps. For delivering standalone apps to users, build an LPK first.

## How To Use LightOS {#how-to-use-lightos}

Normal users do not need to configure system components manually. Open the microserver app store, search for and install the LightOS entry app, then create and manage instances from the LightOS page.

The system, software, and configuration inside a LightOS instance are persisted with that instance. This is the recommended replacement for installing software directly after SSH into `lzcos`. The `lzcos` SSH environment is a read-only system, so changes made to the system through SSH are lost after restart.

LightOS has high privileges and should be exposed only to trusted users or trusted apps.
