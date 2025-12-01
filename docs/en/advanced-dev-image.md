# Development Test Images

`LCMD Developer Tools` supports `docker registry v2` API. You can push local test images to the box for testing according to the following method.

- Create `Dockerfile`

  ```Dockerfile
  FROM busybox:latest

  # All services in lzcapp must always be in running state, otherwise the application will enter error state
  CMD ["sleep", "1d"]
  ```

- Build image

  ```sh
  docker build --platform linux/amd64 -t lzc/helloworld:latest .
  ```
  If you are currently using ARM64 or non-x86 architecture, you need to force specify the platform as `linux/amd64` through `--platform`.

- Re-tag the image to `dev.$BOXNAME.heiyu.space` address, `$BOXNAME` is the target box name.

  ```sh
  BOXNAME=$(lzc-cli box default)
  docker tag lzc/helloworld:latest dev.$BOXNAME.heiyu.space/lzc/helloworld:latest
  ```

- Push image

  ```sh
  docker push dev.$BOXNAME.heiyu.space/lzc/helloworld:latest
  ```

- Use in `lzc-build.yml` or `lzc-manifest.yml`

  ```yml
  services:
    helloworld:
      image: dev.$BOXNAME.heiyu.space/lzc/helloworld:latest
  ```

- Pull image

  ```sh
  docker pull dev.$BOXNAME.heiyu.space/lzc/helloworld:latest
  ```
