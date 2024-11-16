# 开发测试镜像

`懒猫开发者工具` 应用支持 `docker registry v2` API，通过这个接口您可以将本地的测试镜像推送到盒子进行测试。举个例子：

- 创建 `Dockerfile`

  ```Dockerfile
  FROM busybox:latest

  CMD ["echo", "hello world!"]
  ```

- 构建镜像

  ```sh
  docker build -t lzc/helloworld:latest .
  ```

- 重新 `tag` 镜像成 `dev.$BOXNAME.heiyu.space` 地址, `$BOXNAME` 为目标盒子名.

  ```sh
  BOXNAME=$(lzc-cli box default)
  docker tag lzc/helloworld:latest dev.$BOXNAME.heiyu.space/lzc/helloworld:latest
  ```

- 推送镜像

  ```sh
  docker push dev.$BOXNAME.heiyu.space/lzc/helloworld:latest
  ```

- `lzc-build.yml` 或者 `lzc-manifest.yml` 中使用

  ```yml
  services:
    helloworld:
      image: dev.$BOXNAME.heiyu.space/lzc/helloworld:latest
  ```

- 拉取镜像

  ```sh
  docker pull dev.$BOXNAME.heiyu.space/lzc/helloworld:latest
  ```
