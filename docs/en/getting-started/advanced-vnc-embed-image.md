# Advanced Practice: Embedded Images and Upstream Customization {#advanced-vnc-embed-image}

## Goal {#goal}

After this guide, you can verify these 3 points:

1. Understand persistence boundary: `/lzcapp/var` persists after restart; manual changes in runtime paths (such as `/home/lazycat`) are lost unless baked into image/startup logic.
2. `/lzcapp/documents` is for user documents access and is not the same as app-private persistence.
3. Master basic LPK v2 embedded image flow: customize upstream image with small changes and publish.

## Prerequisites {#prerequisites}

1. You completed [How LPK Works](./lpk-how-it-works.md).
2. Target system supports LPK v2 embedded image (recommend lzcos 1.5.0+).
3. `lzc-cli project deploy` works in your environment.

## Steps {#steps}

### 1. Create project from gui-vnc template {#step-create-gui-vnc-project}

```bash
lzc-cli project create embed-demo -t gui-vnc
```

At app id prompt, press Enter for default id or type your own.

```bash
cd embed-demo
```

### 2. Check template key configuration {#step-check-template-config}

Check `lzc-build.yml`:

```bash
cat lzc-build.yml
```

You should see:

1. `images.app-runtime` built from `images/Dockerfile`.
2. `upstream-match: registry.lazycat.cloud` configured.
3. `lzc-manifest.yml` references image as `embed:app-runtime`.

### 3. First deploy and access verification {#step-first-deploy-and-verify}

```bash
lzc-cli project deploy
lzc-cli project info
# Wait until the app reaches running state, then continue.
```

By default, `project` commands prefer `lzc-build.dev.yml` when it exists.
Each command prints the active `Build config`.
Use `--release` if you want to operate on `lzc-build.yml`.

Record `Target URL` from `project info` and open it in browser.

### 4. Manually link documents path to desktop (verification first) {#step-manual-link-documents}

Enter container:

```bash
lzc-cli project exec -s desktop /bin/sh
```

Then run inside shell:

```bash
mkdir -p /home/lazycat/Desktop
ln -svfn /lzcapp/documents "/home/lazycat/Desktop/Documents (ReadWrite)"
ls -la /home/lazycat/Desktop
ls -la /lzcapp/documents
exit
```

Refresh VNC desktop, you should see `Documents (ReadWrite)` and be able to access `/lzcapp/documents` data.

### 5. Restart app and observe link loss {#step-restart-and-observe-link-loss}

```bash
lzc-cli project start --restart
```

Check again in container or desktop. The manual link under `/home/lazycat/Desktop` will be lost after restart.

This is expected: data outside `/lzcapp/var` is not guaranteed to persist across restart.

Further reading:

1. [File Access (`/lzcapp/var` and `/lzcapp/documents`)](../advanced-file.md)

### 6. Persist link logic with Dockerfile/startup script {#step-persist-link-via-dockerfile}

For reproducible behavior, bake link creation into image startup logic.

`gui-vnc` template includes `images/startup-script.sh`. Ensure it includes:

```bash
mkdir -p /home/lazycat/Desktop
ln -svfn /lzcapp/documents "/home/lazycat/Desktop/Documents (ReadWrite)"
```

In `images/Dockerfile`, ensure startup script is copied. The `startup-script.desktop` line is commented by default; uncomment it before deploy:

```dockerfile
COPY --chown=lazycat:kasm-user startup-script.sh /home/lazycat/.config/autostart/startup-script.sh
# COPY --chown=lazycat:kasm-user startup-script.desktop /home/lazycat/.config/autostart/startup-script.desktop
RUN chmod +x /home/lazycat/.config/autostart/startup-script.sh
```

Remove `#` for the `startup-script.desktop` COPY line and save.

Then redeploy (`project deploy` will start app automatically):

```bash
lzc-cli project deploy
lzc-cli project info
```

Wait until app is running, then verify `Documents (ReadWrite)` appears automatically.

LPK is designed for one-click reproducible delivery to others. To keep runtime deterministic, only explicitly declared persistent directories are retained; other path changes are cleaned after restart.

Further reading:

1. [LightOS Scenarios (placeholder)](../advanced-lightos.md)

### 7. Verify package contains embedded image {#step-verify-embedded-image-output}

```bash
lzc-cli project release -o embed-demo.lpk
lzc-cli lpk info embed-demo.lpk
```

Expected:

1. `image_count` is greater than `0`.
2. `images:` includes alias `app-runtime` and layer source summary (`embedded_layers` / `upstream_layers`).

## Verification {#verification}

Pass conditions:

1. `project info` shows `Current version deployed: yes`.
2. `Target URL` opens desktop page.
3. `Documents (ReadWrite)` still appears after restart (created by startup script).
4. `lzc-cli lpk info embed-demo.lpk` shows embedded image summary.

## Troubleshooting {#troubleshooting}

### 1. `Cannot resolve embedded image alias` {#error-embedded-alias-not-found}

Reason: `embed:<alias>` does not match `images.<alias>`.

Fix: align alias between `lzc-manifest.yml` and `lzc-build.yml`, then redeploy.

### 2. Build is too slow {#error-build-too-slow}

Checks:

1. First build can be slow (upstream layers download).
2. Small Dockerfile changes on second build should be much faster.
3. Use `lzc-cli project log -f` to check repeated layer fetching.

### 3. Page is blank or unreachable {#error-page-black-or-unreachable}

Check order:

1. `application.routes` points to `http://desktop:6901/`.
2. Run `lzc-cli project log -s desktop -f`.
3. Run `lzc-cli project exec -s desktop /bin/sh` and inspect process status.

### 4. Documents link/desktop entry missing {#error-documents-link-missing}

1. Ensure `images/startup-script.sh` contains link commands.
2. Ensure `COPY startup-script.desktop ...` is uncommented in `images/Dockerfile`.
3. Ensure `images/startup-script.desktop` exists and `Exec` points to `startup-script.sh`.
4. Redeploy and confirm running with `lzc-cli project info`.

## Further Reading {#further-reading}

1. [lzc-build.yml Spec](../spec/build.md)
2. [lzc-manifest.yml Spec](../spec/manifest.md)
3. [File Access (`/lzcapp/var` and `/lzcapp/documents`)](../advanced-file.md)
4. [LightOS Scenarios (placeholder)](../advanced-lightos.md)
