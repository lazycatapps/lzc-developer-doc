# 服务启动依赖
上一章， 我们讲解了让微服自动启动 MySQL 服务。

在软件工程实践中， 如果应用服务启动时 MySQL 服务还没有启动完成， 应用就有可能会报错。

针对这种情况， 微服提供了 `服务启动依赖` 机制， 使用方法也很简单， 在 `lzc-manifest.yml` 文件中的 `application` 字段下加一个 `depends_on` 子字段即可， 举例：

```yml
application:
  depends_on:
    - mysql
```

这样配置好以后， 微服在启动应用时会把 `depends_on` 下的所有服务启动完毕后再启动应用容器。