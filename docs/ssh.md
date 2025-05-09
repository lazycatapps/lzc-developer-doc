## 如何开启 ssh?

1. 懒猫客户端商店安装`懒猫开发者工具`
2. 打开`懒猫开发者工具`会看到一个 ssh 的设置项开启和设置密码
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
3. [playground-docker](./dockerd-support.md)使用不受限的dockerd服务
