# Python Application Configuration Details
In the previous chapter, we explained how to build the first Python application. In this chapter, we will analyze the construction details of Python applications in detail.

## lzc-build.yml

[lzc-build.yml](./spec/build) is the configuration file that controls application building.

First, let's introduce the basic keywords and uses of this configuration file:

- `buildscript`: Build script, can be the path address of the build script, or directly write sh commands

    According to the script defined by buildscript, all files under contentdir are packaged into an lpk compressed package, and finally installed into LCMD.

- `manifest`: Specify the manifest.yml file path of the lpk package

    The manifest file here is the application's meta information, such as application name, version, description, etc.

- `contentdir`: Specify the content to be packaged, which will be packaged into lpk

    The contentdir here needs to be specified as a directory. Files in the directory will be packaged into lpk.

- `pkgout`: Output path of the lpk package

    The pkgout here is the output path of the lpk package, and the packaged lpk package will be output to this path.

- `icon`: Path of the lpk package icon. If not specified, a warning will be issued

    icon only allows files with png suffix. The application icon.png aspect ratio needs to be 1:1, and it is recommended that the width and height be greater than or equal to 512*512 pixels

- `devshell`: Specify development dependency situation

    The devshell here is the development dependency situation, such as development dependency dependencies, development dependency scripts, etc.


::: details Example
```shell
# In the entire file, you can use values defined in the file specified by the manifest field through ${var}

# buildscript
# - Can be the path address of the build script
# - If the build command is simple, you can also directly write sh commands
buildscript: sh build.sh

# manifest: Specify the manifest.yml file path of the lpk package
manifest: ./lzc-manifest.yml

# contentdir: Specify the content to be packaged, which will be packaged into lpk
contentdir: ./dist

# pkgout: Output path of the lpk package
pkgout: ./

# icon specifies the path of the lpk package icon. If not specified, a warning will be issued
# icon only allows files with png suffix
icon: ./lzc-icon.png

# devshell specifies the development dependency situation
# In this case, use alpine:latest as the base image and add the required development dependencies in dependencies
# If dependencies and build exist at the same time, dependencies will be used first
devshell:
  routes:
    - /=http://127.0.0.1:5173
  dependencies:
    - nodejs
    - npm
    - python3
    - py3-pip
  setupscript: |
    export npm_config_registry=https://registry.npmmirror.com
    export PIP_INDEX_URL=https://pypi.tuna.tsinghua.edu.cn/simple
```
:::

## lzc-manifest.yml

[lzc-manifest.yml](./spec/manifest) is the configuration file that controls application Meta information.

First, let's introduce the basic keywords and uses of this configuration file:
- `name`: Application name
- `package`: Application subdomain. If not listed in LCMD MicroServer app store, this name can be arbitrary
- `version`: Version number
- `description`: Application description
- `license`: Application distribution license
- `homepage`: Project homepage
- `author`: Author information

The most important part of this file is [application.routes](./advanced-route):

```shell
application:
  subdomain: todolistpy
  routes:
    - /=file:///lzcapp/pkg/content/web
    - /api/=exec://3000,./lzcapp/pkg/content/backend/run.sh
```

- `subdomain: todolistpy`

  Application subdomain, associated with the domain name in the `package` field above.

- `/=file:///lzcapp/pkg/content/web`

  This route means that when users access the application, that is, when accessing the route `/`, the application will automatically return the `index.html` file in the `/lzcapp/pkg/content/web` directory. `/lzcapp/pkg/content` actually corresponds to the `contentdir` directory in the `lzc-build.yml` file mentioned earlier.

- `/api/=exec://3000,./lzcapp/pkg/content/backend/run.sh`:

  This route means that when users access the route `/api/`, the application will start the `./lzcapp/pkg/content/backend/run.sh` script to provide backend services. The backend service script listens on port 3000.


The `application` field has the following fields:

| Field           | Description                                                           | Notes                                   |
|----------------|---------------------------------------------------------------|----------------------------------------|
| subdomain      | Configure application subdomain                                                  | Only default value, subsequent system versions allow administrator adjustment |
| multi_instance | [Configure multi-instance (same application, user data isolation)](./advanced-multi-instance) | Only default value, subsequent system versions allow administrator adjustment |
| routes         | [Configure application rules](./advanced-route)                                | All HTTP related logic should be declared here         |
| public_path    |  [Configure external API](./advanced-public-api)                           | Not recommended                             |
| ingress        | [Configure external ports](./advanced-public-api)                           | Only recommended when providing non-HTTP services       |
| file_handler    | Declare file types supported by this app, [Application Association](./advanced-mime)            | Tool-type applications are recommended to configure this option so that when opening files in cloud drive, this application can be selected|

::: details 示例

```yml
package: abc.example.com # App's unique id, when listing to store need to ensure no conflicts, try to use developer's own domain as suffix.
version: 2.0.2           # App version

name: Test abc   # Software name, will be displayed in launcher and similar places
description: Simple and easy-to-use English learning software

license: https://choosealicense.com/licen ses/mit/  # Software's own license
homepage: http://github.com/snyh/abc # Software homepage, will be reflected in store and other places
author: snyh@snyh.org # lpk author, will be reflected in store and other places

unsupported_platforms: # Unsupported platforms, if not written means full platform support. lpk itself can be installed, but platforms in the list below cannot open this software
  - linux
  - macos
  - windows
  - android
  - ios
  - tvos


 # application runs as a special container, the corresponding service name is fixed `app`, other services can communicate with app through this name
application:
  background_task: false # Whether there are background tasks, if yes, the system will not actively hibernate this app

  subdomain: abc  # Expected app domain, if the system already has the corresponding domain, it will prompt the user to choose another domain. The final app assigned domain is based on /lzcapp/run/app.subdomain

  routes:
    - /api/=exec://8000,/lzcapp/pkg/content/bin/backend     # Format consistent with /usr/bin/lzcinit -up parameter
    - /api/=http://service.appid.lzcapp:8000            # Multi-instance applications will automatically add uid in route
    - /=file:///lzcapp/pkg/content/dist/

  public_path:
    - /api/public  # By default, all paths require login to access, paths under public_path allow access without login

  ingress:
    - protocol: tcp     # tcp or udp
      port: 22          # Port number that needs to be exposed
      service: db       # If empty, it is the port within this app container, can also specify the name of other services like db

  multi_instance: true # Whether to enable multi-instance

  workdir: /lzcapp/pkg/content / # Set WORKDIR for lzcinit and subsequent child processes, if not set or directory does not exist, keep using container's WORKDIR information

  usb_accel: false # Mount /dev/bus/usb to container
  gpu_accel : false # Whether to allow hardware acceleration
  kvm_accel: true  # After enable, will mount /dev/kvm and /dev/network-host to all services

  file_handler: # Declare file types supported by this app, mime must have at least one record, actions must support at least open
    mime:  # Register to system according to mime type
      - x-scheme-handler/http
      - x-scheme-handler/https
      - text/html
      - application/xhtml+xml
      - x-lzc-extension/km      # App supports .km file name suffix
    actions:   # URL path to open corresponding files, called by file manager and other apps
      open: /open?file=%u   # %u is a specific file path on a webdav, must exist
      new:  /open?file=%u   # %u is a specific file path on a webdav, may not exist
      download: /download?file=%u # %u is a specific file path on a webdav, must exist

   environment:
    - MYPASSWORD=123456

  image:  alpine:3.16  # Optional runtime environment, if empty, use the image corresponding to the sdk version. If listed to store, the image here must be uploaded to the store repository for unified hosting.

  handlers:
    # When https/http/exec type reverse proxy in routes encounters an error, render the corresponding template.
    # If the error type is unable to return any data, a 502 response will be generated, such as when the upstream server does not exist or network is unreachable and completely unable to get an http response.
    #
    # Other cases select the corresponding template according to http response status code
    # If error handling page is hit, the http response status code itself will not be modified
    #
    # Page rendering uses this data structure
      # struct {
      #    StatusCode int
      #    ErrorDetail string # In cases where http response cannot be obtained, this field will display corresponding error information and set StatusCode to 502
      # }
    error_page_templates:
      502: /lzcapp/pkg/content/errors/502.html.tpl
      404: /lzcapp/pkg/content/errors/404.html.tpl



services: # Traditional docker image startup method, if you need database and other supporting containers to run together, you can declare them here. Traditional apps like nextcloud, aria2c can also use this method for compatible operation
  backend:
    image: alpine:3.18

    depends_on:
      - db

  db: # Currently only supports the following parameters, configuration fields like network, ipc are (intentionally) not supported
    image: bitnami/wordpress:5.8.2
    environment:
      - ALLOW_EMPTY_PASSWORD=yes
      # OAuth related environment variables
      - LAZYCAT_AUTH_OIDC_CLIENT_ID=xxx
      - LAZYCAT_AUTH_OIDC_CLIENT_SECRET=xxx
      - LAZYCAT_AUTH_OIDC_ISSUER_URL=xxx


    # Only the following mount points are supported:
    # - /lzcapp/run
    # - /lzcapp/run/mnt/home
    # - /lzcapp/var
    # - /lzcapp/cache
    # - /lzcapp/pkg
    binds:
      - /lzcapp/run/mnt/home:/home  # Mount /lzcapp/run/mnt/home (i.e., user documents) directory to /home directory in container
      - /lzcapp/var/db:/data
      - /lzcapp/cache/db:/cache
      - /lzcapp/pkg/content/entrypoint.sh:/entrypoint.sh # Mount files within lpk package

    entrypoint: /bin/sh -c
    command: "/usr/bin/nextcloud"

    depends_on:
      - ui

    # network_mode only supports host mode, after enabling this service can access all network cards, but loses lzcdns feature
    # Try not to use this mode unless necessary, need to carefully handle code, there is a high security risk
    # If you want to provide internal services in network=host service, please listen on the internal IP `host.lzcapp`, do not directly listen on 0.0.0.0
    network_mode: "host"

    # cpu_shares default value is 1024, reducing this value can lower container priority. This restriction only takes effect when CPU cycles are limited.
    # When CPU cycles are sufficient, all containers will use all required CPU resources. cpu_shares will not prevent containers from being scheduled in Swarm mode.
    # It prioritizes container CPU resources for available CPU cycles, but does not guarantee or reserve any specific CPU access rights.
    cpu_share: 2
    # cpus is used to specify the amount of available CPU resources that the container can use. For example, if the host machine has two CPUs, and you set --cpus="1.5",
    # the container is guaranteed to use at most one and a half CPUs.
    cpu: 2

```

:::

## Data Storage Path
When the backend needs to store files or databases, please ensure that files are placed in the `/lzcapp/var` directory. Files stored in other directories will be cleared by the system after the application Docker restarts.
