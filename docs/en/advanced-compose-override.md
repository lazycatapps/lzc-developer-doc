# Compose Override

After lzcos v1.3.0+, for some runtime permission requirements that the lpk specification currently cannot cover,
it can be indirectly implemented through the [compose override](https://docs.docker.com/reference/compose-file/merge/) mechanism.

override is a transitional mechanism. For some controllable permissions, they will gradually be supported in the lpk specification and decided by administrators when installing applications.
The compatibility of the override mechanism is not supported, especially volumes mounting system internal file paths.

::: warning

If you use this mechanism, please explain it in the developer group or contact developer services through [Contact Us](https://lazycat.cloud/about?navtype=AfterSalesService) to find customer service. The official will record it so as to communicate with developers before compatibility may be broken, otherwise submitting to the app store for review may be rejected.

:::

# Usage

Add the `compose_override` field in the lzc-build.yml file.

For example:
```yml
pkgout: ./
icon: ./lazycat.png
contentdir: ./dist/

compose_override:
  services:
    # Specify service name
    some_container:
      # Specify caps that need to be dropped
      cap_drop:
        - SETCAP
        - MKNOD
      # Specify files that need to be mounted
      volumes:
        - /data/playground:/lzcapp/run/playground:ro
```


::: tip File Mounting

1. When mounting host system files, try not to mount /lzcsys/ related files. The layout here belongs to lzcos internal details and is likely to change in subsequent versions.
2. The keyword for mounting files in docker-compose is `volumes`, note not to write it as `binds` in lzc-manifest.yml. (The semantics of binds and volumes are very different, so we deliberately don't use consistent names)

:::


# Debugging

1. Confirm that the final generated lpk contains a file named `compose.override.yml`, the content should be a valid `compose merge` file
2. SSH into `/data/system/pkgm/run/$appid` and confirm there is an `override.yml` file
3. Use `lzc-docker-compose config` to view that the final merged file is as expected
