# Multiple Entrypoints

When an application needs to provide multiple entrypoints (for example, a main page and an admin page), you can declare multiple entries under `application.entries` in `lzc-manifest.yml`. The launcher will show multiple entry buttons in the same app (right-click menu), so users can jump directly to different pages.

Requires lzcos v1.4.3+.

```yml
application:
  subdomain: demoapp
  entries:
    - id: main
      title: "Main"
      path: /
    - id: admin
      title: "Admin"
      path: /admin
      prefix_domain: admin
locales:
  en:
    entries.main.title: "Main"
    entries.admin.title: "Admin Console"
```

- `id`: unique entry identifier, must be unique within the application
- `title`: display name; can be localized using `entries.<entry_id>.title` in `locales`
- `path`: entry path, usually starts with `/`
- `prefix_domain`: optional entry domain prefix; the final domain looks like `<prefix>-<subdomain>.<rootdomain>`

Only create entrypoints that users actually need to access directly, to avoid confusion caused by too many entry buttons.
