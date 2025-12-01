# Error Pages
When an application encounters an error, you can add a `handlers` sub-field under the `application` field in the `lzc-manifest.yml` file:

```yml
application:
  handlers:
    error_page_templates:
      502: /lzcapp/pkg/content/errors/502.html.tpl
      404: /lzcapp/pkg/content/errors/404.html.tpl
```

The above configuration means that when the LCMD system detects an HTTP error, it will automatically find the error page template provided by the application based on the configured error code.

The default template is:
```html
<html>
  <body>
    <h1>
      Your application encountered an error!
    </h1>
    <p>
      Failure reason: {{ .ErrorDetail}}
    </p >
    <p>
      Please try again later
    </p >
  </body>
</html>
```

- `ErrorDetail`: This is LCMD's built-in error code. When an application error occurs, the LCMD system will replace `ErrorDetail` with the container failure log content to help developers troubleshoot errors