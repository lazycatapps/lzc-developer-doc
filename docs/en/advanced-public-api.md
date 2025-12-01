# Independent Authentication

## HTTP Service

When you access LCMD applications with a browser, you must enter a username and password for security.

However, in some scenarios with low security requirements, such as public file download services, entering username and password is too cumbersome. You only need to add a `public_path` sub-field under the `application` field in the `lzc-manifest.yml` file.

In addition, some applications have their own independent authentication mechanisms, such as carrying tokens in URLs. In this case, you can disable forced authentication for such service addresses.

```yml
application:
  public_path:
    - /api/public
```

The above configuration means that when the browser accesses the `/api/public` route, it can access directly without entering username and password.

Note:
1. `public_path` only disables LCMD's HTTP account password authentication. Access still requires logging into the LCMD client to establish a virtual network
2. `public_path` has certain risks. Please do not expose sensitive APIs externally, such as services that read your files.


Additionally, you can use the `!` exclusion syntax to bypass forced authentication for the entire path except `/admin`. (Not recommended to use this method to bypass forced authentication)
```yml
application:
  public_path:
    - /
    - !/admin
```

::: warning Exclusion syntax has the highest priority and does not support nested judgment
For example, if you add the rule `/admin/unsafe` in the above rules, this rule will not take effect.
:::
