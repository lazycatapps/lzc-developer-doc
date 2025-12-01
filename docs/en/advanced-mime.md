# Application Association
LCMD MicroServer's goal is to build a family digital life hub. As more and more ecosystem applications emerge, many files in LCMD Cloud Drive can be directly opened by ecosystem applications.

For example, if you develop a music player, you expect that when users click on music files in LCMD Cloud Drive, LCMD Cloud Drive will automatically pop up an application selection dialog for users to choose.

You only need to add a `file_handler` field in the `lzc-manifest.yml` file:

```yml
application:
  file_handler:
    mime:
      - audio/mpeg
      - audio/mp3
    actions:
      open: /open?file=%u
```

- `mime`: List of MIME types supported by the application
- `actions`: Action to start the application, currently only `open` option

The application needs to support the `/open` route and parse the content of the `file` parameter. The system will automatically replace the `%u` parameter with the actual path of the opened file.

After v1.3.8+, the mime field supports some special configurations:

- `text/*` includes all text category mime types including `text/plain`
- `*/*` All file types will be matched, suitable for special application scenarios such as "MD5 calculation" and "file sharing". (Note: add string quotes when writing this, otherwise yaml will try to parse `*` causing errors)
- `x-lzc-extension/md` All files with md extension
