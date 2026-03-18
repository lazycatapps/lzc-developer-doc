# Changelog

This page aggregates developer-related system changes and lists versions in reverse chronological order.

## v1.5.0 (Unreleased) {#v1-5-0}

### Compatibility Changes

- `/lzcapp/document` and `/lzcapp/run/mnt/home` are now marked as deprecated and kept only for compatibility, and the document access root path is `/lzcapp/documents`.

## v1.4.3 {#v1-4-3}

### Feature Changes

- clientfs support
- Launcher [Multiple Entrypoints](./advanced-entries.md)
- custom/show-lzcapp-loading-time
- Added [hc api_auth_token](./advanced-api-auth-token.md)

### Compatibility Changes

- The hostname of lpk containers is changed from a random value to a fixed value based on appid
- Fix timezone binding

## v1.4.2 {#v1-4-2}

### Feature Changes

- pkgm now returns more detailed installation error reasons
- Preinstalled systemd-container component
- Support mounting `/lzcsys/run/clientfs`; lpk-level support requires a later lzcos version
- Fix `public_path` issues in multi-instance mode

### Compatibility Changes

Further improve compatibility between `manifest.yml/services` and the docker compose spec.

Main impacts on existing lpk:
1. `services.xx.user` values like 1000 will error; use "1000"
2. `services.xxx.evironment` will error when empty

## v1.4.1 {#v1-4-1}

### Feature Changes

- Added `services.[].healthcheck` field, maintaining 100% compatibility with docker-compose.
- Added `timeout` field to `application.health_check`
- `timedatectl set-timezone xx` after ssh supports permanent storage

### Compatibility Changes

- Deprecated `services.[].health_check` field, new code should use `healthcheck` field.
  If existing lpk files have `health_check.start_period` (previously only this time-related configuration was supported), they need to migrate to the `healthcheck` version
  and add unit suffix.
  Previously, no matter what this field was set to, the final health check for services (excluding app) would be forced to `start_period=300s, start_interval=1s`, meaning the developer's set value was silently deprecated. Therefore, no compatibility handling is done to expose the issue as soon as possible.

## v1.3.9 {#v1-3-9}

### Feature Changes

- Added `disable_trim_location` option to `UpstreamConfig` to avoid stripping the url path sent by the browser
- Application startup interface displays real-time startup logs, convenient for debugging lpk startup process
- lpk image download process postponed from `install lpk` to `start lpk` (will automatically enter startup process after installation)
- Fixed launcher application log window preemption issue

## v1.3.8 {#v1-3-8}

### Feature Changes

- Added support for editing environment variables in application list (administrators access related UI in System Settings -> Application List)
- Added [Application Deployment Mechanism](./advanced-manifest-render.md)
- Added lzcapp runtime file: /lzcapp/run/manifest.yml  (/lzcapp/pkg/manifest.yml is the original content in lpk)
- Added deployment environment variable `LAZYCAT_DEPLOY_ID`
- Added `manifest.yml:ext_config.default_prefix_domain`
- Added support for tcp-ingress [forwarding 80/443 traffic](./advanced-l4forward.md)
- Added [wildcard support](./advanced-mime.md) for `manifest.yml:application.file_handler`
- Added two lzcapp runtime directories `/lzcapp/document/` and `/lzcapp/media/` (lzcos also added these two directories so system and lzcapp can use unified path prefix), corresponding to previous `/lzcapp/run/mnt/home` and `/lzcapp/run/mnt/media`
- Added `manifest.yml:services[].mem_limit`
- Added `manifest.yml:services[].shm_size`
- Added [manifest.yml:UpstreamConfig](./advanced-route.md#upstreamconfig) to support domain prefix-based routing, skipping TLS certificate verification and other functions
- Added [sysbox-runc](./spec/manifest.md#container-config) runtime to run privileged processes like dockerd, systemd without needing and permissions.
- Added application log entry in launcher (requires Developer Tools v0.3.0+)
- Fixed /dev/shm/ permissions to normal 1777
- Fixed `HOME` environment variable when executing `setup_scripts`
- Capture more error information during lpk startup process for frontend interface
- Adjusted `/lzcapp/var` directory permissions to 1777 to reduce adaptation work for some containers

### Compatibility Changes

- `/data/app/var/$pkg_id/$uid` directory adjusted to `/data/appvar/$deloy_id`
-  pkgm/ss: Compatible with QueryApplication.TodoRemoveAppidList
- /data/system/pkgm/cfgs directory completely deprecated, related information uniformly stored in system/pkgm/deploy.{db,var}
- Removed default `seccomp=unconfined` and `apparmor=unconfined` added to all containers
- `/data/document/` adjusted to readonly to prevent applications from incorrectly creating subdirectories here. (Some applications cannot be installed on new systems, already installed ones are not affected)
   Official is contacting developers of scanned related applications to assist with migration.
- `application.background` field adjusted to advisory role, default does not enable auto-start
- Removed temporary file `/data/system/pkgm/apps/$appid$/docker-compose.yml`

### Serious Incompatibility Notice

After system upgrade to v1.3.8+, if system downgrade is performed, all application data will be unusable. (Document data is not affected, and application data itself is still on the data disk)

The reason is to support more flexible deployment logic in the future. The appvar logic has been adjusted from `$pkd_id/$uid` to `$deploy_id` to remove the uid concept.
If rolling back to a lower version system, application internal data will be re-initialized and created.

## v1.3.7 {#v1-3-7}

### Feature Changes

- Support systemd --user
- Default image source adjusted from Mainland China to debian default CDN. (Mainland China users can use hc ustc to temporarily switch back to domestic)

## v1.3.6 {#v1-3-6}

### Feature Changes

- Application multi-domain mechanism adjustment [Secondary Domains](./advanced-secondary-domains.md)
- Added fan control related operations `hc fanctl` in ssh
- Multi-instance applications will be assigned independent domains (browsers and other third-party access no longer need to add `uid@` operations)
- Multi-instance applications support TCP/UDP forwarding
- Truly implemented domain conflict resolution (different applications using the same `application.subdomain`, system will automatically modify the domain of the application installed later)

## v1.3.4 {#v1-3-4}

### Feature Changes

- Support configuring multiple [Secondary Domains](./advanced-secondary-domains.md) for one lzcapp
- Support globally disabling default mounting of user documents
- pkgm level forced detection of `min-os-version`
- Document snapshots enabled by default regardless of whether backup disk is used (once per hour, retain last 48 hours)
- lpk supports applications using grpc-web traffic (need to enable `ext_config.disable_grpc_web_on_root`)
- Home directory after ssh adjusted to permanent storage
- Fixed lpk file association

In v1.5.0, the ability for applications to access user document data will be disabled by default. If applications really need to access user documents,
they can configure the [application.ext_config.enable_document_access](./spec/manifest.md#ext_config) field in advance

If you need to test the effect, you can execute `touch /lzcsys/var/runtime/config/disable_auto_mount_home` after ssh to enable this security configuration in advance.

## v1.3.0 {#v1-3-0}

### Feature Changes

- Ignore entries named "app" in `services.depends_on` in manifest.yml.
  Because the system will force wait for all containers to be ready, there is no need to fill this in. On the contrary, filling it in will cause circular waiting leading to timeout.
- services in manifest.yml support `init` field, so a small number of containers can enable child process recycling
- lpk supports embedding [compose.override.yml](./advanced-compose-override.md) files to support functions not yet covered by lpk
- When uploading logs, a copy of the actually uploaded log file will be stored in the administrator cloud drive root directory
- lzcos `vm.max_map_count` adjusted to 1048576
- Added resolvectl in ssh for convenient DNS status query
- Fixed issue where pg-docker cannot auto-start after restart
- Updated docker-ce to 27.5.1
- Added [Internationalization](./spec/manifest.md#i18n)/Localization support
- lzcapp forced network isolation enabled, prohibiting direct network communication between different applications. Cross-application communication is done through `$service.$appid.lzcapp` form. (Containers within applications are not subject to this restriction)
  - If cross-application access was previously configured, it needs to be migrated to port forwarding tools, forwarding target ports to "LCMD virtual network card" for indirect access.
  - Please update lzc-cli to 1.2.61+, otherwise old version behavior may cause unexpected issues

## v1.2.0 {#v1-2-0}

### Feature Changes

1. Added [Application Usage Instructions](./spec/manifest.md#basic-config) feature for stronger application usage prompts
2. Added [setup_script](./advanced-setupscript.md) feature for simple initialization operations
3. Added [user](./spec/manifest.md#container-config) field, compatible with docker-compose syntax
4. Added [TCP/UDP Dynamic Port Forwarding](./advanced-public-api.md#tcp-udp-ingress)
   ::: tip Note
   Previous versions' manifest.yml:application.ingress field only supported fixed port forwarding,
   new version supports dynamic forwarding with specified port ranges
   :::
5. Added [exclude public_path](./advanced-public-api.md) syntax
6. Removed replace `$$` to `$` conversion operation.
   ::: tip Note
   In previous versions, `$$` appearing in `lzc-manifest.yml` files would be forcibly replaced with `$`
   :::
7. Added `LAZYCAT_APP_DOMAIN` to deployment environment variables to avoid confusion
   ::: tip Note
   Previous versions only had `LAZYCAT_APP_ORIGIN` in deployment environment variables, but runtime automatically injected environment variables only had `LAZYCAT_APP_DOMAIN`.
   New version adds `LAZYCAT_APP_DOMAIN` in both runtime and deployment.
   :::

### Bug Fixes

1. Fixed issue where ssh password was lost after restart
2. Fixed system interference with `http Authorization header` (e.g., when applications use basic auth)
   ::: tip Note
   Previous versions' system would parse `http authorization header` as LCMD's own account password, causing applications to be unable to use this field
   :::
3. Added `hc data_convert` command after ssh, supports online conversion of raid0/raid1/plain
4. Fixed issue where pg-docker could not automatically start after power failure restart

### Unimplemented Features

1. Support [Dynamic Rendering of lzc-manifest.yml](./advanced-manifest-render.md) feature, allowing some parameters to be configured by users after application installation.
2. Experimental support for [Deployment Guide](./advanced-user-deploy-guide.md) feature, allowing some parameters to be configured by users after application installation.
