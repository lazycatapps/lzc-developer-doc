# 公开 API 服务
当您用浏览器访问微服应用时， 为了您的安全必须输入用户名密码才能访问。

但是在一些安全要求不高的场景， 比如公共文件下载服务， 输入用户名密码太繁琐， 您只需要在 `lzc-manifest.yml` 文件中的 `application` 字段下加一个 `public_path` 子字段即可

```yml
application:
  public_path:
    - /api/public
```

上面配置的意思是， 当浏览器访问 `/api/public` 路由时， 可以直接访问， 不需要输入用户名密码。

需要注意的是：
1. 即使 `public_path` 选项打开的同时， 依然需要登录微服客户端才能加密访问
2. `public_path` 有一定的风险， 请不要对外暴露敏感 API， 比如读取您的文件的服务