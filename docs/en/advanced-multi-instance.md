# Multi-Instance
LCMD applications have two running modes:
* Single-instance: No matter how many users call it, only one application container is started, and user access permissions are controlled internally by the application
* Multi-instance: Each user clicking the application icon will start a separate application container, and user data is naturally isolated from each other due to the container mechanism

The advantage of single-instance is saving system memory resources, the disadvantage is that the application needs to develop a lot of code to handle data isolation for different users' access.

The advantage of multi-instance is that the application code is simple and doesn't need to consider permission issues for different users' access. The disadvantage is that when multiple users access LCMD, multiple containers will be started, occupying additional memory resources.

LCMD applications default to single-instance. When you want to develop multi-instance applications, just add a `multi_instance` sub-field under the `application` field in the `lzc-manifest.yml` file, for example:

```yml
application:
  multi_instance: true
```

::: warning
When LCMD applications are configured with different running modes of **single-instance** and **multi-instance**, there will be certain differences in [file services](./advanced-file.md) and [service domain construction rules](./advanced-domain.md). For details, please refer to the following documents.

1. [After configuring multi-instance, the application cannot mount files to the user document directory (LCMD Cloud Drive defaults to showing the main directory)?](./advanced-file.md#mount-point-list)

2. [What are the domain construction rules between container services after the application is configured with multi-instance?](./advanced-domain.md#multi-instance-multi-user-application)

3. In multi-instance mode, each user accesses a different application domain
:::
