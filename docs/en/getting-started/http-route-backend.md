# HTTP Routing with Backend {#http-route-backend}

## Goal {#goal}

After this guide, you can verify these 3 points:

1. `exec://...` handler does both "start process + forward traffic", suitable for single-container backend bootstrap.
2. `http://...` handler only forwards traffic and does not start processes, suitable for existing independent services.
3. You understand default protection, minimal `application.public_path` exposure, and why backend data should go to `/lzcapp/var`.

## Prerequisites {#prerequisites}

1. You completed [Hello World in 5 Minutes](./hello-world-fast.md).
2. `lzc-cli box default` points to your target microservice.
3. `curl` is available on your machine (optional verification).

## Steps {#steps}

### 1. Create a backend template project {#step-create-backend-template}

```bash
lzc-cli project create hello-api -t todolist-golang
```

At app id prompt, press Enter for default id or provide your own. Then enter project dir:

```bash
cd hello-api
```

### 2. Deploy first and verify default `exec` handler {#step-verify-default-exec-handler}

```bash
lzc-cli project deploy
lzc-cli project info
```

By default, `project` commands prefer `lzc-build.dev.yml` and print the active `Build config`.
Use `--release` if you want to operate on `lzc-build.yml`.

Before continuing, ensure `lzc-cli project info` includes `Project app is running.`  
If still starting, wait a few seconds and rerun `lzc-cli project info`.

Open `Target URL` in browser and complete login. In browser Console, run:

```javascript
fetch('/api/health').then((r) => r.json()).then(console.log);
fetch('/api/todos').then((r) => r.json()).then(console.log);
```

Expected:

1. `/api/health` returns `{"status":"ok"}`.
2. `/api/todos` returns an `items` list (usually empty initially).

Notes:

1. Default route is `/=exec://3000,/app/run.sh`.
2. This runs `/app/run.sh` and forwards traffic to `127.0.0.1:3000`.
3. That is the core behavior of `exec` handler: start + forward.

### 3. Add a third-party service to demonstrate `http` handler {#step-add-third-party-service}

Edit `lzc-manifest.yml`. Keep default `exec` route and add `/inspect/` route with `whoami` service:

```yml
application:
  image: embed:app-runtime
  routes:
    - /inspect/=http://whoami:80/
    - /=exec://3000,/app/run.sh

services:
  whoami:
    image: registry.lazycat.cloud/traefik/whoami
```

Notes:

1. `whoami` is a real third-party service used as a clear `http` forwarding target.
2. `/inspect/` goes to `http://whoami:80/` and does not trigger `/app/run.sh`.
3. Keep `"/=exec://..."` unchanged so original Todo behavior remains.
4. Put `/inspect/` before `"/="` to avoid broader rule matching first.

### 4. Deploy and verify `http` handler {#step-verify-http-handler}

```bash
lzc-cli project deploy
lzc-cli project info
```

In logged-in browser Console:

```javascript
fetch('/inspect/').then((r) => r.text()).then(console.log);
```

Expected: output includes whoami request info (`Hostname`, `RemoteAddr`, `Headers`, etc.).

### 5. (Optional) Configure `application.public_path` and test with curl {#step-configure-public-path}

By default, HTTPS paths are protected by login state. Direct unauthenticated `curl` is expected to be blocked.

If you want to expose health check path, add in `lzc-manifest.yml`:

```yml
application:
  public_path:
    - /api/health
```

Redeploy and verify:

```bash
lzc-cli project deploy
lzc-cli project info
curl "<Target URL>/api/health"
```

Only expose minimal paths in `public_path`.

### 6. Check Todolist data directory (`/lzcapp/var`) {#step-check-lzcapp-var}

First add 1-2 todo items in app UI so data files are created.

Enter app container:

```bash
lzc-cli project exec -s app /bin/sh
```

Then run inside container:

```bash
ls -la /lzcapp/var
```

For Todolist-like backend data, files should be in `/lzcapp/var` (for example `/lzcapp/var/todos.json`).

Important: only content under `/lzcapp/var/` persists across app restarts.

## Verification {#verification}

Pass conditions:

1. `project info` shows `Current version deployed: yes`.
2. `/api/health` returns `status: "ok"`.
3. `/inspect/` returns whoami request info.
4. Using `project exec`, you can verify Todolist persistent path under `/lzcapp/var`.

## Troubleshooting {#troubleshooting}

### 1. `/inspect/` returns `404` or `502` {#error-inspect-404-502}

Check in order:

1. Route is exactly `/inspect/=http://whoami:80/`.
2. This route is before `"/="`.
3. `services.whoami.image` is `registry.lazycat.cloud/traefik/whoami`.
4. Run `lzc-cli project log -s whoami -f`.

### 2. `curl <Target URL>/api/health` is blocked or redirected to login {#error-health-api-blocked}

Reason: default protection is enabled.

Fix:

1. Verify via logged-in browser with `fetch('/api/health')`.
2. Or add `application.public_path` and redeploy.

### 3. Not sure where Todolist data should be stored {#error-where-to-store-data}

Use `/lzcapp/var`; only this path persists across restarts.

### 4. No visible change after deploy {#error-no-change-after-deploy}

```bash
lzc-cli project deploy
lzc-cli project info
```

Ensure `Current version deployed: yes`.

## Next {#next}

Continue with: [How LPK Works](./lpk-how-it-works.md)
