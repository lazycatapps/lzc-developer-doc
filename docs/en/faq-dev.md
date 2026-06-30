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

## Since the `/lzcapp/pkg/content` directory is read-only, scripts packaged in it will fail to create files in the current directory

The `/lzcapp/pkg/content` directory contains resource files packaged into lpk and is not allowed to be modified. There are two solutions:

1. Change the creation directory in the script, such as `/lzcapp/cache` or `/lzcapp/var`. For detailed information, see [Access LCMD Data](./advanced-file)
2. Change the application execution directory by specifying the current running directory through the `application.workdir` field. For detailed information, see the [lzc-manifest.yml Specification](./spec/manifest.md)

## Where to write the introduction document for listing applications?

In listing applications, readme is not automatically read, and we don't know where readme comes from, so the application introduction is filled in the developer management interface [click to jump](https://developer.lazycat.cloud/manage).

Application List -> Submit Changes -> Application Description


## Why do software installed after ssh get lost? {#readonly_lzcos}

The `lzcos` SSH environment is a read-only system. After restart, all changes made to the system through SSH are lost.

If you need persistent software, configuration, or runtime environment, use [LightOS](./advanced-lightos.md).
