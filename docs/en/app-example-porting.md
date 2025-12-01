# Porting an Application

Sometimes we just want to deploy an existing docker, or the application we develop depends on someone else's docker, and we need to run a database, message communication and other components first. Next, we will use gitlab as an example to guide you step by step to port the docker image to LCMD MicroServer.

Before this, you need to briefly understand the meaning of each configuration item in `lzc-build.yml` and `lzc-manifest.yml`. This is explained in [Application Configuration Details](./app-example-python-description#lzc-build-yml), and the existing content will not be repeated here. Here is a brief introduction to the `services` configuration item. In `services`, we can specify multiple services, each service has a name, and under each service, we can specify a docker image. For this image, we can configure environment variables, storage location, startup commands, etc. A well-configured services for an application looks roughly like this:

```yaml
services:
  servicename1:
    image: xxx/yyy:123
    environment:
      - ENV1=123
    binds:
      - /lzcapp/run/mnt/home:/home
```

## Converting Docker Image to LCMD MicroServer Application

### Find the Docker Command to Start the Application

As a simple example, suppose we need to port Gitlab to LCMD MicroServer. We can first go to the gitlab official website and view [Docker Engine Installation](https://docs.gitlab.com/ee/install/docker/installation.html#install-gitlab-by-using-docker-engine) to see a docker command below

```bash
 sudo docker run --detach \
   --hostname gitlab.example.com \
   --env GITLAB_OMNIBUS_CONFIG="external_url 'http://gitlab.example.com'" \
   --publish 443:443 --publish 80:80 --publish 22:22 \
   --name gitlab \
   --restart always \
   --volume $GITLAB_HOME/config:/etc/gitlab \
   --volume $GITLAB_HOME/logs:/var/log/gitlab \
   --volume $GITLAB_HOME/data:/var/opt/gitlab \
   --shm-size 256m \
   gitlab/gitlab-ee:<version>-ee.0
```
### Convert Docker Command to LCMD Manifest

There are many parameters here. We mainly focus on `--env`, `--publish`, `--volume`, and the final image name (here the image name is `gitlab/gitlab-ee:<version>-ee.0`).

Among them

- `--env` is environment variables, corresponding to `environment` in `lzc-manifest.yml`
- `--publish` indicates which port `docker` uses to provide services. LCMD does not recommend directly exposing ports. If it is an `http(s)` service, it is recommended to configure it through `routes` under `application`. If it is **not** an `http(s)` service and you want to expose it, such as port 22 here, which should be an ssh protocol service, you can configure it through `application -> ingress`. For detailed configuration, refer to [External API Service](./advanced-public-api.md).
- `--volume` usually configures places in docker used to store persistent data. This can be achieved by configuring the `service -> binds` parameter. The value after `volume`, the right side of the colon corresponds to the actual location in docker. The value received by LCMD's `binds` configuration is similar to `volume`, except that the left side of our colon must be a file path starting with `/lzcapp`, usually starting with `/lzcapp/var` or `/lzcapp/cache`. For more detailed directories, refer to [File Access](./advanced-file). For example, `$GITLAB_HOME/config:/etc/gitlab` here, converted to `binds` configuration, can be written as `/lzcapp/var/config:/etc/gitlab`
- Image name. Just fill this in after the `image` parameter of `service`

Therefore, this docker command can be converted to `services` configuration:

```yaml
services:
  gitlab:
    image: gitlab/gitlab-ee:17.2.8-patch7
    binds:
      - /lzcapp/var/config:/etc/gitlab
      - /lzcapp/var/logs:/var/log/gitlab
      - /lzcapp/var/data:/var/opt/gitlab
    environment:
      - GITLAB_OMNIBUS_CONFIG=external_url 'http://gitlab.example.com'
```

Combined with the required fields in [Application Configuration Details](./app-example-python-description.html#lzc-build-yml), configure routes or ingress to the ports provided by docker (in this example, routes need to fill in port 80, ingress needs to configure port 22), forming a complete `lzc-manifest.yml`:

```yaml
lzc-sdk-version: '0.1'
name: GitLab
package: cloud.lazycat.app.gitlab
version: 17.2.8-patch1
application:
  routes:
    - /=http://gitlab.cloud.lazycat.app.gitlab.lzcapp:80 # gitlab is the name in services, .lzcapp is a fixed suffix, the middle part is the package field above
  subdomain: gitlab
  ingress:
    - protocol: tcp
      port: 22
      service: gitlab
services:
  gitlab: # Application name can be customized, but cannot use app // [!code warning]
    image: gitlab/gitlab-ee:17.2.8
    binds:
      - /lzcapp/var/config:/etc/gitlab
      - /lzcapp/var/logs:/var/log/gitlab
      - /lzcapp/var/data:/var/opt/gitlab
    environment:
      - GITLAB_OMNIBUS_CONFIG=external_url 'http://gitlab.${LAZYCAT_BOX_DOMAIN}'; gitlab_rails['lfs_enabled'] = true;
```


### Complete Required Files and Install

With `lzc-manifest.yml`, we download a [Gitlab png format](https://images.ctfassets.net/xz1dnu24egyd/1IRkfXmxo8VP2RAE5jiS1Q/ea2086675d87911b0ce2d34c354b3711/gitlab-logo-500.png) as an icon, and finally fill in an `lzc-build.yml`:

```yaml
pkgout: ./ # Location of the output lpk package
icon: ./icon.png   # Location of the icon file
```

The required files are ready. Put these files in a folder, and the file directory looks like this:

```
.
├── lzc-build.yml     // LCMD application build script
├── lzc-manifest.yml  // LCMD application Meta information configuration
└── icon.png          // LCMD application icon
```

In the command line, enter this directory and execute `lzc-cli project build`. After execution, there will be one more file in the directory:
`cloud.lazycat.app.gitlab-v17.2.8-patch1.lpk`, finally execute `lzc-cli app install ./cloud.lazycat.app.gitlab-v17.2.8-patch1.lpk` to install the lpk package just created, and the installation is complete.

## Converting docker-compose to LCMD MicroServer Application

Still using Gitlab from before, we can first go to the Gitlab official website and find how to install via [Docker Compose](https://docs.gitlab.com/ee/install/docker/installation.html#install-gitlab-by-using-docker-compose)

You can see a **docker-compose.yml** file example below

```yaml
version: '3.6'
services:
  gitlab:
    image: gitlab/gitlab-ee:<version>-ee.0
    container_name: gitlab
    restart: always
    hostname: 'gitlab.example.com'
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        # Add any other gitlab.rb configuration here, each on its own line
        external_url 'https://gitlab.example.com'
    ports:
      - '80:80'
      - '443:443'
      - '22:22'
    volumes:
      - '$GITLAB_HOME/config:/etc/gitlab'
      - '$GITLAB_HOME/logs:/var/log/gitlab'
      - '$GITLAB_HOME/data:/var/opt/gitlab'
    shm_size: '256m'
```

There are many configurations here. The hierarchical structure of services here is actually similar to services in lzc-manifest. However, we mainly focus on `environment`, `ports`, `volumes` and `image`. These parameters correspond to `--env`, `--publish`, `--volume` and image name mentioned in the docker command above respectively. Following the same conversion rules, you can convert `docker-compose.yml` to `lzc-manifest.yml`. The remaining steps are the same as the [Complete Required Files and Install](#补全需要的文件并安装) section.

## Common Questions

### What to do if image cannot be pulled

Due to some reasons, the docker image may not be successfully pulled. If it's just for personal use, you can consider referring to the **Re-tag Image** step and **Push Image** step in [Development Test Images](./advanced-dev-image.md). If considering public use, you need to establish your own registry.


## Community Porting Tools

If you find the steps tedious and want to convert docker-compose to LCMD application with one click, you might want to try the conversion tool from community experts:
[docker2lzc](https://www.npmjs.com/package/docker2lzc)

## Official Porting Open Source Repository

The official porting open source is a great learning repository, welcome to refer to:
https://gitee.com/lazycatcloud/appdb

## Advanced Reading

Using Github Actions to implement automatic updates and releases of Docker applications: <https://lazycat.cloud/playground/guideline/572>

How LCMD MicroServer uses OpenID Connect (OIDC): <https://lazycat.cloud/playground/guideline/663>
