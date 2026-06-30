# 开启 SSH

## 如何开启 SSH?

1. 管理员账户登录懒猫客户端，搜索'系统设置' -> 进入'系统设置' -> '基本信息'

2. 下拉找到**开启SSHD** 

   设定root用户密码并开启选项
   

![image.png](https://lzc-playground-1301583638.cos.ap-chengdu.myqcloud.com/guidelines/1279/020f110e-2a7a-4a72-a7ab-4263c06834eb.png "image.png")

![image.png](https://lzc-playground-1301583638.cos.ap-chengdu.myqcloud.com/guidelines/1279/abb22a5b-d31c-4d4d-9e48-36cf5557c6b2.png "image.png")


3. 在您喜欢的终端执行`ssh root@{微服名称}.heiyu.space`

4. cat /data/README.md 查看数据盘相关文件说明


::: tip 使用公钥登录ssh

lzcos v1.3.2+版本后，root用户的家目录会调整为永久存储，

若您需要使用公钥登录，可以在电脑上使用ssh-copy-id root@xxx.heiyu.space自动把本地公钥添加到微服中。

若电脑上没有ssh-copy-id命令，可以ssh登录后，手动把公钥添加到~/.ssh/authorized_keys文件
:::


技术原因无法做到在底层系统被任意修改的前提下提供正常的微服平台，因此不适合用来直接安装系统软件提供服务。
ssh主要的目的是

1. 观察审计系统行为
2. [nmtui](./network-config.md)等高风险网络操作
3. 临时排查系统问题；如果需要长期保存软件、配置或运行环境，请使用 [LightOS](./advanced-lightos.md)。如果需要使用 Docker，请在 [LightOS 中使用 Docker](./dockerd-support.md)
