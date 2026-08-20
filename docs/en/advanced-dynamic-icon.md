# Dynamic Application Icons

## Goal

An application can update the icon shown in the launcher while it is running. This can be used to indicate backup status, the number of available updates, completed downloads, errors, and other state changes. The application generates the dynamic PNG content itself without modifying the static icon in the LPK.

## Prerequisites

- Lazycat Microserver system (lzcos) `v1.6.2` or later.
- The application is installed through an LPK and is running normally.
- Each dynamic icon must be a PNG file no larger than 1 MiB.

## File Location and Naming

Create a `launcher-icon` directory under the application runtime directory:

```text
/lzcapp/run/launcher-icon/
```

Applications can use the following two file names:

- `icon.png`: deployment-wide icon, visible to users who can access the current deployment.
- `<uid>.png`: user-specific icon, visible only to the user whose UID appears in the file name. For example, use `10001.png` for UID `10001`. Only single-instance applications need to consider this form; multi-instance applications normally only need `icon.png`.

File names must exactly match these formats. Other files are not treated as dynamic icons. Applications do not need to create any additional slot files.

## Display Priority

If multiple icon sources are available for the same user, the launcher uses the following priority:

1. User-specific icon `<uid>.png`.
2. Deployment-wide icon `icon.png`.
3. Static icon `pkg/icon.png` from the LPK.

When the active dynamic icon file is deleted, the launcher falls back to the next available icon. If no dynamic icon exists, it displays the static icon from the LPK.

## Updating the Icon

Write the new PNG content to the corresponding file. It is recommended to write to a temporary file first and then rename it over the target file, preventing the launcher from reading partially written content:

```bash
set -eu

icon_dir=/lzcapp/run/launcher-icon
tmp_file="$icon_dir/.icon.tmp"

mkdir -p "$icon_dir"
cp /path/to/new-icon.png "$tmp_file"
mv -f "$tmp_file" "$icon_dir/icon.png"
```

For an animated icon, write different frames to the same file as needed. Update the file only when the icon content actually changes to avoid unnecessary writes.

Dynamic icons are stored in the application runtime directory and are not persistent. The icon state under `/lzcapp/run/launcher-icon/` is lost when the application or LPK restarts, and the launcher temporarily displays the static icon from the LPK. The application should regenerate and write its dynamic icon each time it starts.

## Update Frequency and Content Count

The system processes at most four icon changes per second, for a maximum of approximately 4 FPS. Intermediate frames above this rate are not displayed.

If the icon uses many different contents, keep the number of distinct contents within 24 whenever possible to make the most efficient use of the browser cache. Simple badges, status indicators, and low-frequency icon changes do not need to consider these limits.

## Stopping Dynamic Display

Delete a dynamic icon file when it is no longer needed:

```bash
rm -f /lzcapp/run/launcher-icon/icon.png
```

After a user-specific file is deleted, that user falls back to the deployment-wide icon or static icon. Deleting the entire `launcher-icon` directory stops all dynamic icon overrides.

## Verification

1. Confirm that the file exists and is a PNG:

   ```bash
   ls -l /lzcapp/run/launcher-icon
   file /lzcapp/run/launcher-icon/icon.png
   ```

2. Check whether the application icon is updated in the launcher.
3. Delete the dynamic file and confirm that the launcher falls back to the next available icon.

Dynamic application icons do not modify the LPK and do not change the static icon shown in other application lists or system settings. Application drag previews use the original static icon from the LPK.

## Troubleshooting

### The Icon Does Not Change

- Confirm that the Lazycat Microserver system version is `v1.6.2` or later.
- Confirm that the directory is `/lzcapp/run/launcher-icon/` and that the file name matches one of the supported formats.
- Confirm that the file was actually replaced and is no larger than 1 MiB.
- Confirm that the file was written to the current application runtime directory, not a similarly named directory on the build or development machine.
- If the application has just restarted, confirm that its startup logic regenerated and wrote the dynamic icon.

### Different Users See Different Icons

For a single-instance application, check whether both `<uid>.png` and `icon.png` exist. A user-specific file has higher priority and overrides the deployment-wide icon. Multi-instance applications normally do not need to create `<uid>.png`.

### Restoring the Default Icon

Delete all dynamic icon files. The application will then display `pkg/icon.png` from the LPK.
