# 发布自己的第一个应用

1. 在发布应用前，您需要注册成为懒猫微服的开发者。[点击注册](https://lazycat.cloud/login?redirect=https://developer.lazycat.cloud/)

2. 提交应用到商店审核:

    - 打开管理界面，根据界面上的引导提交审核. [点击跳转](https://developer.lazycat.cloud/manage)

    - 或者通过 `lzc-cli` (1.2.43 及以上版本) 提交审核，如何安装 `lzc-cli` 请参考 [开发环境搭建](https://developer.lazycat.cloud/lzc-cli.html)

        ```bash
        lzc-cli project build
        lzc-cli appstore publish ./your-app.lpk
        ```
