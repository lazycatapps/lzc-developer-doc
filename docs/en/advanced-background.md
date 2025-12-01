# Background Persistence
The LCMD system has an advanced `service scheduling mechanism`. When an application is inactive for a long time, the LCMD system will automatically stop the corresponding application to improve the overall system response speed.

When we develop certain special applications, such as downloaders that need to download files in the background for a long time, we don't want the LCMD system to schedule our applications based on activity.

You only need to add a `background_task` sub-field under the `application` field in the `lzc-manifest.yml` file, for example:

```yml
application:
  background_task: true
```

:::tip
Tip: In the current LCMD version, the `background_task` parameter will also affect whether the application auto-starts (note that auto-start behavior is only effective for [single-instance](./advanced-multi-instance) applications). Of course, users can manually disable application auto-start behavior in LCMD's application management.
:::
