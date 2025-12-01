# Publish Your First Application

1. Before publishing an application, you need to [register](https://lazycat.cloud/login?redirect=https://developer.lazycat.cloud/) a community account and visit the [Developer Center](https://developer.lazycat.cloud/manage). Follow the interface guidance to submit for review (after submitting the application, it's recommended to contact the customer service group or try to [contact us](https://lazycat.cloud/about?navtype=AfterSalesService) for quick review). After the application is completed, you become a LCMD MicroServer developer.

2. Before submitting your application to the store for review, please read the [Application Store Submission Guide](./store-submission-guide.md).

3. Submit your application to the store for review:

    - Or submit for review through the command-line tool `lzc-cli` (version 1.2.54 and above). For how to install `lzc-cli`, please refer to [Development Environment Setup](https://developer.lazycat.cloud/lzc-cli.html)

        ```bash
        lzc-cli project build
        lzc-cli appstore publish ./your-app.lpk
        ```

# Push Images to Official Registry

The network quality of Docker Hub is not very stable, so Lazycat officially provides a stable registry for everyone to use.

:::tip
Before developers finally upload to the store, they need to push the images used in the lpk to the official registry. After the upload is complete, they need to manually adjust the relevant references in manifest.yml (otherwise it may cause application reviewers to be unable to install the application, leading to **store review failure**)
:::

```
$ lzc-cli appstore copy-image <image name accessible from public network>
# After upload completion, it will print registry.lazycat.cloud/<community-username>/<image name>:<hash version>
```

For example:
```
lzc-cli appstore copy-image alpine:3.18
Waiting ... ( copy alpine:3.18 to lazycat offical registry)
lazycat-registry: registry.lazycat.cloud/snyh1010/library/alpine:d3b83042301e01a4

```

Note that the use of `registry.lazycat.cloud` has the following limitations:

1. To ensure the stability of the images referenced by LPK, the generated image tag will be replaced with IMAGE_ID. Each time `copy-image` is executed, the server will forcibly execute a `docker pull`
2. The uploaded image must exist on the public network. The `pull` operation is performed on the server side, so images that only exist locally on the developer cannot be `copy-image`
3. The uploaded image must be referenced by at least one store application. The repository will periodically perform garbage collection operations
4. `registry.lazycat.cloud` is only for internal use within LCMD. Using it outside LCMD will have black technology **rate limiting**
