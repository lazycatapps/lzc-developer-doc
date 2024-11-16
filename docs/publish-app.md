# 发布自己的第一个应用

1. 在发布应用前， 您需要[注册](https://lazycat.cloud/login?redirect=https://developer.lazycat.cloud/)成为懒猫微服的开发者。

2. 提交应用到商店审核:

    - [打开管理界面](https://developer.lazycat.cloud/manage)， 根据界面上的引导提交审核。

    - 或者通过命令行工具 `lzc-cli` (1.2.43 及以上版本) 提交审核， 如何安装 `lzc-cli` 请参考 [开发环境搭建](https://developer.lazycat.cloud/lzc-cli.html)

        ```bash
        lzc-cli project build
        lzc-cli appstore publish ./your-app.lpk
        ```
