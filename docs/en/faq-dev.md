# Common Development Application Issues

## Which software cannot be listed on the app store?
Currently, pornography, gambling, drugs, airdrops, cracked software, or software that violates Chinese laws cannot be listed on the app store.

## Before logging into the developer center, first confirm whether your `lazycat.cloud` account has developer permissions?

After [registering](https://lazycat.cloud/login?redirect=https://developer.lazycat.cloud/) a lazycat.cloud account, you also need to apply to become a developer, otherwise there will be permission issues when logging in.

## Resource files are large, how to package and publish?

For some applications that need to carry resource files (similar to model files, to avoid issues like `long download time` or `unable to download` when users start), you can package the files into the image, then do subsequent operations in the image startup script or `entrypoint`.

::: warning
Resource files copied to the image cannot be placed under the `/lzcapp/` directory. This directory will be overwritten when the application runs. For more detailed explanation, see [Access LCMD Data](./advanced-file)
:::

If resource files are small (<200M), you can also package resource files into lpk, and when the application runs, read them by accessing the `/lzcapp/pkg/content` directory.

## In `devshell` mode, the `contentdir` specified in `lzc-build.yml` will not be packaged

If you need to package the content in contentdir, you can use `lzc-cli project devshell --contentdir`.

## Since the `/lzcapp/pkg/content` directory is read-only, scripts packaged in it will fail to create files in the current directory

The `/lzcapp/pkg/content` directory contains resource files packaged into lpk and is not allowed to be modified. There are two solutions:

1. Change the creation directory in the script, such as `/lzcapp/cache` or `/lzcapp/var`. For detailed information, see [Access LCMD Data](./advanced-file)
2. Change the application execution directory by specifying the current running directory through the `application.workdir` field. For detailed information, see [application field](./app-example-python-description)

## Where to write the introduction document for listing applications?

In listing applications, readme is not automatically read, and we don't know where readme comes from, so the application introduction is filled in the developer management interface [click to jump](https://developer.lazycat.cloud/manage).

Application List -> Submit Changes -> Application Description


## Why do software installed after ssh get lost? {#readonly_lzcos}

Some users find that they still cannot fully control the system after applying for ssh permissions. Even the most basic apt install xxx operations will lose related software after restart.
We fully understand users' confusion.
- My system, my rules, why should I be restricted?
- I have enough ability to be responsible for my own operations!
- How come all the configurations I worked so hard to write are gone after a restart?

We are a startup team with technical backgrounds, love tinkering, aspire to freedom, and respect freedom.
We also want to make the product free enough, but we've thought for a long time: what should a good product provide to users?

The fact that system modifications are lost after restart is not to restrict anyone, especially those users who spent real money and precious time supporting us.

The fundamental reason: From a technical perspective, we cannot guarantee that when the system is in any state, a complete set of upper-layer application software can run normally.
This problem is similar to why LCMD MicroServer doesn't just do the system, because only doing the system requires investing a lot of energy in hardware adaptation (our team has done a lot of work in this area over the past 10 years).
If system modifications don't get lost after restart, then with the accumulation of time, the entire system will be in a completely unpredictable state.
To run upper-layer applications in this state, it takes enormous effort to do adaptation (we don't want to waste users' money here).
Worse, a system update might accidentally break user modifications that have been running normally for years. If it involves user data, that would cause disastrous consequences.

We expect to build LCMD MicroServer into a new platform that integrates cross-device capabilities and has extremely high security.
To achieve this goal, many permissions need to be gradually restricted. This restriction is not transferring existing permissions from users to Lazycat manufacturers, but transferring permissions from users and applications to users' LCMD systems.
In this process (currently far from complete), there will inevitably be some decisions that conflict with users (we always know that the final decision-making power should and must be handed over to each specific user)
Initially, the LCMD system didn't open ssh permissions, but considering:
- Users' right to freely audit
- Some functions we haven't considered in the development cycle or haven't had time to implement, we need to give users a way to freely explore
But we never thought of restricting users, otherwise when opening SSH permissions, we would make users sign an agreement to waive warranty like some products do.

The initially envisioned user group was non-technical users, but currently, seed users are all senior users with certain technical capabilities, so this issue is indeed quite prominent.
Therefore, we gradually implemented virtual machines and [playground-docker](./dockerd-support), two components that were originally not considered or even opposed, to solve this user need.

Because we can feel that the lzcapp system has places that cannot meet everyone's needs, and we have the ability to implement improvements, so we made modifications.

Similarly, [Tun mode/Proxy mode](./network) was also proposed together with everyone after we truly felt the troubles of senior users, and we determined the current solution from multiple solutions.

We increasingly realize the logic of making products: understand users' sincere words about the product and treat users with sincerity.

We sincerely thank all the senior experts among the seed users. You are the motivation for us to persist when encountering difficulties.
