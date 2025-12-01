# Dockerd Development Mode

Some developers hope that LCMD can provide complete docker suite functionality. For this type of user, the LCMD system<Badge type="tip" text="≥v1.3.0" /> provides an independent Docker daemon for developers to use.


## Get and Install Dockge Application
Although non-developer users can use the independent docker suite, containers with `privileged` attributes or containers granted permissions such as `CAP_SYS_ADMIN` can read, write and access all file data in LCMD MicroServer, and may even cause irreparable errors to the system. Therefore, please carefully read the remaining content of this article after enabling the independent docker suite.

<script setup>
const downloadFile = () => {
  const link = document.createElement('a');
  link.href = 'https://dl.lazycat.cloud/lzcos/files/8b7557bf-82a9-442a-835c-608b4319a49a.lpk';
  link.download = 'dockge.lpk';
  link.click();
};
</script>

<button :class="$style.button" @click="downloadFile">Download Dockge Application LPK</button>

<style module>
.button {
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  background-color: #2965D7;
  cursor: pointer;
}
</style>

 - Click the button above to download the `Dockge` application lpk.
 - Upload the lpk to `Lazycat cloud storage` and right-click to install.
 - After installation is complete, restart LCMD MicroServer, and the system will automatically activate the independent Docker daemon.
 - (Optional) If you need dockerd to start automatically after restart, please set dockage to run in the background in the application list

## Usage Instructions

Developers can run their own containers through the following two methods:

### Dockge
This application can be accessed in the application list. Through the `dockge` application, users can write their own docker-compose files, deploy and test

![dockge](./public/dockge.png)

### pg-docker
After ssh logging into LCMD, users can directly use the `pg-docker` command to execute docker-related commands. Through the port exposed by pg-docker, they can directly access it in the intranet

### About docker storage location
Containers created in the independent docker suite will use mechanical hard drives as storage space by default, and container content will be persistently stored after restart.

### Map user data files to containers
Docker containers are isolated from the system by default. You can use the following compose expression to bind user disk data to containers.
```yaml
service:
  example:
    volumes:
      - /data/document/{username}:/container/internal/path
```

### Map container ports
Using the following compose expression, you can forward the `2222` port inside the container to the external `3333` port. If you need to access it, you can access it through LCMD MicroServer `LAN ip:port number`.
```yaml
service:
  example:
    ports:
      - 3333:2222
```

### Containers with permissions
Adding `privileged` permissions or certain [privileges](https://man.archlinux.org/man/core/man-pages/capabilities.7.en) (such as `CAP_SYS_ADMIN`) to containers will grant the container extremely high system permissions. In this way, containers may have a great impact on LCMD MicroServer's system resources, and may even cause serious security risks. Especially when exposing high-risk ports of containers to external networks, containers may become targets of attacks.

If malicious programs run inside containers, these programs may affect the normal operation of the system, and may even cause data loss or corruption. Therefore, when using Compose files provided by others, you need to pay special attention to whether the files will grant containers excessive permissions to avoid potential security risks.
```yaml
service:
  example:
    privileged: true
    cap_add:
      - SYS_ADMIN
      - NET_ADMIN # Open all network-related permissions
```

### Cannot create containers after installing Dockge
After installing Dockge, if you find that creating containers fails and there's this prompt popping up in the bottom right corner. Please ensure that MicroServer has been restarted after the first installation. Without installing the Dockge application, the system will not enable the independent docker daemon to ensure security.
![Bottom right error prompt](./public/dockge-error.png)

### pg-docker configuration file
Currently, the `daemon.json` file of `pg-docker` is located in the `/lzcsys/var/playground/daemon.json` directory. This configuration will not be rolled back after modification, but the following configuration items will be forcibly configured by the system:
 - `bridge` LCMD MicroServer network environment related
 - `cgroup-parent` LCMD MicroServer process scheduling related