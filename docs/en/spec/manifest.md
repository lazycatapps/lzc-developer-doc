# lzc-manifest.yml Specification Document

## 1. Overview
`lzc-manifest.yml` is a file used to define application deployment-related configurations. This document will describe its structure and the meaning of each field in detail.

## 2. Top-level Data Structure `ManifestConfig`

### 2.1 Basic Information {#basic-config}

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `package` | `string` | Application's unique ID, must be globally unique, recommended to start with personal domain |
| `version` | `string` | Application version number, X, Y and Z are non-negative integers, X is the major version number, Y is the minor version number, and Z is the revision number, format: `X.Y.Z`, [Read detailed specification](https://semver.org/)|
| `name` | `string` | Application name |
| `description` | `string` | Application description |
| `usage` | `string` | Application usage instructions, if not empty, will be automatically rendered when each user in LCMD first accesses this application |
| `license` | `string` | Application license description |
| `homepage` | `string` | Application homepage |
| `author` | `string` | Author name, if through store channel then store account has higher priority |
| `min_os_version` | `string` | Minimum system version required by this application, if not met the application installation will fail, and the app store will refuse to install this application |

### 2.2 Other Configurations
| Field Name | Type | Description |
| ---- | ---- | ---- |
| `ext_config` | `ExtConfig` | Experimental properties, not publicly available yet |
| `unsupported_platforms` | `[]string` | Platforms not supported by the application, valid fields are: "ios", "android", "windows", "macos", "linux", "tvos" |
| `application` | `ApplicationConfig` | lzcapp core service configuration |
| `services` | `map[string]ServiceConfig` | Traditional docker container related service configuration |
| `locales` | `map[string]I10nConfigItem` | Application localization configuration (optional configuration item), **requires lzc-os version >= v1.3.0** |


## 3. `IngressConfig` Configuration
### 3.1 Network Configuration
| Field Name | Type | Description |
| ---- | ---- | ---- |
| `protocol` | `string` | Protocol type, supports `tcp` or `udp` |
| `port` | `int` | Target port number, if empty, uses the actual inbound port |
| `service` | `string` | Service container name, if empty, defaults to the special service `app` |
| `description` | `string` | Service description, for system components to render application services for administrators to review |
| `publish_port` | `string` | Allowed inbound port number, can be a specific port number or port range like `1000~50000` |
| `send_port_info` | `bool` | Send the actual inbound port as uint16 type in little endian to the target port before data forwarding |
| `yes_i_want_80_443`| `bool` | If true, allows forwarding 80,443 traffic to the application, at this time the traffic completely bypasses the system, so authentication, wake-up, etc. will not take effect|


## 4. `ApplicationConfig` Configuration
### 4.1 Basic Configuration
| Field Name | Type | Description |
| ---- | ---- | ---- |
| `image` | `string` | Application image, if no special requirements, leave empty to use system default image (alpine3.21) |
| `background_task` | `bool` | If `true`, will automatically start and not be automatically hibernated, defaults to `true` |
| `subdomain` | `string` | Inbound subdomain for this application, application opens using this subdomain by default |
| `multi_instance` | `bool` | Whether to deploy in multi-instance form |
| `usb_accel` | `bool` | Mount related devices to `/dev/bus/usb` in all service containers |
| `gpu_accel` | `bool` | Mount related devices to `/dev/dri` in all service containers |
| `kvm_accel` | `bool` | Mount related devices to `/dev/kvm` and `/dev/vhost-net` in all service containers |
| `depends_on` | `[]string` | Dependencies on other container services, only supports other services within this application, and enforces detection type as `healthly`, optional |

### 4.2 Functional Configuration
| Field Name | Type | Description |
| ---- | ---- | ---- |
| `file_handler` | `FileHandlerConfig` | Declare file extensions supported by this application, so other applications can call this application when opening specific files |
| `routes` | `[]string` | Simplified HTTP related routing rules |
| `upstreams` | `[]UpstreamConfig` | Advanced version HTTP related routing rules, coexisting with routes |
| `public_path` | `[]string` | List of HTTP paths for independent authentication |
| `workdir` | `string` | Working directory when `app` container starts |
| `ingress` | `[]IngressConfig` | TCP/UDP service related |
| `environment` | `[]string` | Environment variables for `app` container |
| `health_check` | `AppHealthCheckExt` | Health check for `app` container, only recommended to set `disable` field during development and debugging, not recommended to replace, otherwise the system's default injected automatic dependency detection logic will be lost |

## 5. `HealthCheckConfig` Configuration
### 5.1 AppHealthCheckExt
| Field Name | Type | Description |
| ---- | ---- | ---- |
| `test_url` | `string` | Only effective under application field. Extended detection method, directly provides an HTTP URL without relying on curl/wget and other command lines inside the container |
| `disable` | `bool` | Disable health check for this container |
| `start_period` | `string` | Startup wait period time, if not entering `healthly` state after exceeding this time range, will become `unhealthy` |
| `timeout` | `string` | If a single detection takes longer than `timeout`, the detection is considered failed |


### 5.2 HealthCheckConfig

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `test` | `[]string` | What command to execute in the corresponding container for detection, such as: `["CMD", "curl", "-f", "http://localhost"]`
| `timeout` | `string` | If a single detection takes longer than `timeout`, this detection is considered failed |
| `interval` | `string` | Interval between each detection |
| `retries` | `int` | After how many consecutive detection failures, the entire container enters unhealthy state. Default value 1 |
| `start_period` | `string` | Startup wait period time, if not entering `healthly` state after exceeding this time range, will become `unhealthy` |
| `start_interval` | `string` | During the start_period time, how often to execute detection |
| `disable` | `bool` | Disable health check for this container |


## 6. `ExtConfig` Configuration {#ext_config}

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `enable_document_access` | `bool` | If true, mounts document directory to /lzcapp/run/mnt/home |
| `enable_media_access` | `bool` | If true, mounts media directory to /lzcapp/run/mnt/media |
| `disable_grpc_web_on_root` | `bool` | If true, no longer hijacks application's grpc-web traffic. Needs to work with new version lzc-sdk so system's own grpc-web traffic can be forwarded normally|
| `default_prefix_domain` | string | Will adjust the [final domain](../advanced-secondary-domains) opened after clicking the application in the launcher, can write any string without `.` |



## 7. `ServiceConfig` Configuration

### 7.1 Container Configuration {#container-config}

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `image` | `string` | Docker image for the corresponding container |
| `environment` | `[]string` | Environment variables for the corresponding container |
| `entrypoint` | `*string` | Entrypoint for the corresponding container, optional |
| `command` | `*string` | Command for the corresponding container, optional |
| `tmpfs` | `[]string` | Mount tmpfs volume, optional |
| `depends_on` | `[]string` | Dependencies on other container services (except the name app), only supports other services within this application, and enforces detection type as `healthly`, optional |
| `healthcheck` | `*HealthCheckConfig` | Health check strategy for the container, old version `health_check` has been deprecated |
| `user` | `*string` | UID or username for container operation, optional |
| `cpu_shares` | `int64` | CPU shares |
| `cpus` | `float32` | Number of CPU cores |
| `mem_limit`| `string\|int` | Container's memory limit |
| `shm_size`| `string\|int` | /dev/shm/ size |
| `network_mode` | `string` | Network mode, currently only supports `host` or leave empty. If `host`, the container's network will be the host network space. In this mode, applications must pay attention to authentication when performing network listening, avoid listening on `0.0.0.0` unless necessary |
| `netadmin` | `bool` | If `true`, the container has `NET_ADMIN` permissions and can operate network-related system calls, please do not use unless necessary. If using this feature, please be careful not to disturb iptables related rules |
|`setup_script` | `*string` | Configuration script, script content will be executed with root permissions, then execute original entrypoint content according to OCI specification. This field conflicts with entrypoint and command fields, cannot be set simultaneously, optional |
| `binds` | `[]string` | lzcapp container rootfs will be lost after restart, only data under `/lzcapp/var`, `/lzcapp/cache` paths will be permanently retained. Therefore, other directories that need to be retained need to be bound under these two directories. This list only supports paths starting with `/lzcapp` |
| `runtime` | `string` | 	Specify OCI runtime. Supports `runc` and `sysbox-runc`. sysbox-runc has higher isolation, can run complete dockerd, systemd, etc. But does not support namespace sharing related functions like network_mode=host|


## 8. `FileHandlerConfig` Configuration
### 8.1 File Processing Configuration
| Field Name | Type | Description |
| ---- | ---- | ---- |
| `mime` | `[]string` | List of supported MIME types |
| `actions` | `map[string]string` | Action mapping |

## 9. `HandlersConfig` Configuration

### 9.1 Handler Configuration
| Field Name | Type | Description |
| ---- | ---- | ---- |
| `acl_handler` | `string` | ACL handler |
| `error_page_templates` | `map[string]string` | Error page templates, optional |


## 10. `UpstreamConfig` Configuration
| Field Name | Type | Description |
| ---- | ---- | ---- |
| `location` | `string` | Path matched by entry |
| `disable_trim_location` | `bool` | When forwarding to `backend`, do not automatically remove the `location` prefix (lzcos v1.3.9+)|
| `domain_prefix` | `string` | Domain prefix matched by entry |
| `backend` | `string` | Upstream address, needs to be a valid url, supports three protocols: http, https, file |
| `use_backend_host` | `bool` | If true, when accessing upstream, the http host header uses the host in backend, not the host when the browser requests |
| `backend_launch_command` | `string` | Automatically start the program in this field |
| `trim_url_suffix` | `string` | Automatically delete specified characters that the url may carry when requesting backend |
| `disable_backend_ssl_verify` | `bool` | Do not perform ssl security verification when requesting backend |
| `disable_auto_health_checking` | `bool` | Disable system automatic health checking generated for this entry |
| `disable_url_raw_path` | `bool` | If true, removes raw URL from HTTP header |
| `remove_this_request_headers` | `[]string` | Remove HTTP request headers in this list, such as "Origin", "Referer" |
| `fix_websocket_header` | `bool` | Automatically replace Sec-Websocket-xxx with Sec-WebSocket-xxx |
| `dump_http_headers_when_5xx` | `bool` | If HTTP upstream appears 5xx, dump the request |
| `dump_http_headers_when_paths` | `[]string` | If HTTP matches this path, dump the request |



## 11. Localization `I10nConfigItem` Application Configuration {#i18n}

Configure `locales` to make applications support multiple languages. For supported language key specifications, refer to [BCP 47 standard](https://en.wikipedia.org/wiki/IETF_language_tag)

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `name` | `string` | Application name localization field |
| `description` | `string` | Application description localization field |
| `usage` | `string` | Application usage instructions localization field |

::: details Configuration Example
```yml
lzc-sdk-version: 0.1
package: cloud.lazycat.app.netatalk
version: 0.0.1
name: Apple Time Machine Backup
description: Netatalk service can be used for Apple Time Machine backup
author: Netatalk
locales:
  zh:
    name: "Apple 时间机器备份"
    description: "Netatalk 服务可用于 Apple 时间机器备份"
  zh_CN:
    name: "Apple 时间机器备份"
    description: "Netatalk 服务可用于 Apple 时间机器备份"
  en:
    name: "Time Machine Server"
    description: "Netatalk service can be used for Apple Time Machine backup"
  ja:
    name: "タイムマシンサーバー"
    description: "Netatalk サービスは Apple Time Machine のバックアップに使用できます"
application:
  subdomain: netatalk3
```
:::
