# request inject Dev Cookbook

This page does not repeat basic inject syntax. It focuses directly on the most common request inject patterns used in the current `lzc-cli` dev workflow.

Target scenarios:

1. Frontend development: proxy the app entry to a dev machine frontend server.
2. Backend development: return a static guide page when the service is not ready, and proxy to the real backend once ready.
3. Keep all of this active only in dev mode so release stays clean.

Related docs:

1. [Dev Workflow Overview](./getting-started/dev-workflow.md)
2. [inject.ctx spec](./spec/inject-ctx.md)
3. [Script Injection (injects)](./advanced-injects.md)

## 1. Enable only in dev mode {#dev-only}

The recommended pattern is to gate dev-only behavior in manifest build preprocessing, instead of checking many variables inside the script itself.

Example:

```yml
application:
  routes:
    - /=file:///lzcapp/pkg/content/dist
#@build if env.DEV_MODE=1
  injects:
    - id: frontend-dev-proxy
      on: request
      auth_required: false
      when:
        - "/*"
      do:
        - src: |
            // dev only request inject here
#@build end
```

This way the release render result does not contain the inject at all.

## 2. Frontend development: proxy to dev machine {#frontend-dev}

Use this pattern for:

1. `vite`
2. `webpack dev server`
3. Any frontend server running on a local port of the dev machine

Note: `lzc-cli project deploy` syncs the current development machine's `dev.id` into the app instance. The inject script then uses `ctx.dev.id` together with `ctx.net.via.client(...)` to route traffic to that development machine.

Example:

```yml
application:
  routes:
    - /=file:///lzcapp/pkg/content/dist
#@build if env.DEV_MODE=1
  injects:
    - id: frontend-dev-proxy
      on: request
      auth_required: false
      when:
        - "/*"
      do:
        - src: |
            const devPort = 3000;
            const contentType = "text/html; charset=utf-8";

            function renderDevPage(title, subtitle, steps) {
              const items = steps.map(function (step) {
                return "<li>" + step + "</li>";
              }).join("");
              return [
                "<!doctype html>",
                "<html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Frontend Dev</title></head>",
                "<body><h1>", title, "</h1><p>", subtitle, "</p><div>Expected local port: ", String(devPort), "</div><ol>", items, "</ol></body></html>",
              ].join("");
            }

            if (!ctx.dev.id) {
              ctx.response.send(200, renderDevPage(
                "Dev machine is not linked yet",
                "This app is waiting for a frontend dev server from the machine that runs lzc-cli project deploy.",
                [
                  "Run <code>lzc-cli project deploy</code> on your dev machine.",
                  "Start your local dev server with <code>npm run dev</code>.",
                  "Refresh this page after port <code>" + String(devPort) + "</code> is ready.",
                ]
              ), { content_type: contentType });
              return;
            }

            const via = ctx.net.via.client(ctx.dev.id);
            if (!ctx.dev.online()) {
              ctx.response.send(200, renderDevPage(
                "Dev machine is offline",
                "The linked dev machine is not reachable right now.",
                [
                  "Bring the dev machine online.",
                  "Start your local dev server with <code>npm run dev</code>.",
                  "Refresh this page after port <code>" + String(devPort) + "</code> is ready.",
                ]
              ), { content_type: contentType });
              return;
            }

            if (!ctx.net.reachable("tcp", "127.0.0.1", devPort, via)) {
              ctx.response.send(200, renderDevPage(
                "Frontend dev server is not ready",
                "This app is running in dev mode and will proxy requests to your linked dev machine.",
                [
                  "Start your local dev server with <code>npm run dev</code>.",
                  "Make sure the dev server listens on port <code>" + String(devPort) + "</code>.",
                  "Refresh this page after the server is ready.",
                ]
              ), { content_type: contentType });
              return;
            }

            ctx.proxy.to("http://127.0.0.1:" + String(devPort), {
              via: via,
              use_target_host: true,
            });
#@build end
```

Key points:

1. Check `ctx.dev.id` first so the app can explain what is missing.
2. Then check `ctx.dev.online()` to avoid meaningless live probe against a known offline machine.
3. Use `ctx.net.reachable(...)` for the final port readiness probe.
4. Use `ctx.proxy.to(..., { via })` to route traffic to the dev machine.

## 3. Backend development: return a guide page until ready {#backend-dev}

Use this pattern for:

1. Go / Java services that are better started manually in dev mode
2. Any backend that must run inside the real LPK runtime environment

Example:

```yml
application:
#@build if env.DEV_MODE!=1
  routes:
    - /=exec://3000,/app/run.sh
#@build end
#@build if env.DEV_MODE=1
  injects:
    - id: backend-dev-proxy
      on: request
      auth_required: false
      when:
        - "/*"
      do:
        - src: |
            const backendPort = 3000;
            const backendURL = "http://127.0.0.1:" + String(backendPort);
            const contentType = "text/html; charset=utf-8";

            function renderDevPage(steps) {
              const items = steps.map(function (step) {
                return "<li>" + step + "</li>";
              }).join("");
              return [
                "<!doctype html>",
                "<html lang=\"en\"><head><meta charset=\"UTF-8\"><title>Backend Dev</title></head>",
                "<body><h1>Backend dev service is not ready</h1><ol>", items, "</ol></body></html>",
              ].join("");
            }

            if (!ctx.net.reachable("tcp", "127.0.0.1", backendPort)) {
              ctx.response.send(200, renderDevPage([
                "Sync your latest code into the container with <code>lzc-cli project sync --watch</code> or copy it with <code>lzc-cli project cp</code>.",
                "Open a shell with <code>lzc-cli project exec /bin/sh</code> and start or restart the backend process with <code>/app/run.sh</code>.",
                "Refresh this page after port <code>" + String(backendPort) + "</code> is ready.",
              ]), { content_type: contentType });
              return;
            }

            ctx.proxy.to(backendURL, {
              use_target_host: true,
            });
#@build end
```

Key points:

1. In dev mode, remove the auto-start route so the strategy is not bypassed.
2. When the service is not ready, return a static guide page directly.
3. Proxy to the real backend only after the port is actually ready.

## 4. Access lzcos host network or a specific client node {#via-network}

Both `ctx.proxy.to(...)` and `ctx.net.reachable(...)` support `via`.

Access lzcos host network:

```js
ctx.proxy.to("http://127.0.0.1:8080", {
  via: ctx.net.via.host(),
  use_target_host: true,
});
```

Access a specific client node:

```js
if (ctx.dev.id) {
  ctx.proxy.to("http://127.0.0.1:3000", {
    via: ctx.net.via.client(ctx.dev.id),
    use_target_host: true,
  });
}
```

## 5. When to send a static page directly {#when-send-page}

Recommended cases for `ctx.response.send(...)`:

1. Dev machine is not linked yet
2. Dev machine is offline
3. Frontend or backend service is not started yet
4. You want to provide an explicit next step instead of a vague 502

Do not use fallback to release routes by default. That tends to hide the real dev state and makes developers think the dev path is already active.

## 6. Recommended debug order {#debug-order}

Debug in this order:

1. Whether the inject really matches the current path
2. Whether `ctx.dev.id` is empty
3. Whether `ctx.dev.online()` is `true`
4. Whether `ctx.net.reachable(...)` is `true`
5. Whether `ctx.proxy.to(...)` uses the correct `via`

Temporary debug headers are often useful:

```js
ctx.headers.set("X-Debug-Dev-ID", ctx.dev.id || "");
ctx.headers.set("X-Debug-Dev-Online", String(ctx.dev.online()));
```

## 7. Recommended combinations {#recommended-combos}

These helpers work best together:

1. `#@build if env.DEV_MODE=1`
   - Trim dev-only inject at package build time
2. `ctx.dev`
   - Check whether the app is linked to a dev machine and whether it is online
3. `ctx.net.reachable`
   - Check whether the target service is actually ready
4. `ctx.net.via.*`
   - Route traffic to networks outside the container
5. `ctx.response.send`
   - Return a clear guide page when the service is not ready
6. `ctx.proxy.to`
   - Switch to the real target once ready

## Next {#next}

1. For API reference: continue with [inject.ctx spec](./spec/inject-ctx.md)
2. For the full workflow: continue with [Dev Workflow Overview](./getting-started/dev-workflow.md)
3. For inject matching and built-in scripts: continue with [Script Injection (injects)](./advanced-injects.md)
