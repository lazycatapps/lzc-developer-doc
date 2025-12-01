setup_script
============

When porting applications, you may occasionally encounter situations where process permissions are inconsistent with lzcapp's default permissions (root), or need to perform some initialization operations before container startup.

The `manifest.yml:services[].setup_script` field can handle related issues.

::: tip Container Process UID
If it's just a user permission issue, you can use the `manifest.yml:services[].user` field to adjust UID
:::

The principle of `setup_script` is to replace the docker image's own entrypoint/command parameters. After executing `setup_script`, lzcos
automatically executes the original entrypoint/command logic.

When using `setup_script`, you need to pay attention to its execution timing
1. It will be re-executed every time the container starts. Therefore, please note not to repeat operations with side effects.
2. `manifest.yml:services[].binds` is completed when the container enters the created state, at this time `setup_script` has not been executed yet
3. The original entrypoint/command is executed after `setup_script`, so you cannot rely on some initialization states of the container image itself

For example
```yaml
services:
  cloudreve:
    image: registry.lazycat.cloud/xxxxx/cloudreve/cloudreve:a9e2373b7ca59bc4
    binds:
      # First bind a subdirectory under the application var directory to the application's native storage directory,
      # to avoid modifying upstream code. (Here assume it's the /conf/ directory)
      - /lzcapp/var/cloudreve:/conf/

    # Then copy the pre-installed configuration from lpk to the /conf directory
    setup_script: |     # This "|" is yml's multi-line string syntax,
      if [ -z "$(find /conf -mindepth 1 -maxdepth 1)" ]; then
          cp -r /lzcapp/pkg/content/defaults/ /conf/
      fi
```
