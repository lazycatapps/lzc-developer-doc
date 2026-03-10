# New Dev Workflow Overview {#dev-workflow}

The new `lzc-cli` workflow can be understood as three parallel tracks:

1. Frontend development: `lzc-build.dev.yml + request inject + dev machine server`
2. Backend development: `lzc-build.dev.yml + request inject + project sync --watch`
3. Release: `lzc-build.yml + final runtime image`

## 1. Four key files {#three-files}

Typical projects only need these files:

1. `lzc-manifest.yml`
2. `package.yml`
3. `lzc-build.yml`
4. `lzc-build.dev.yml`

Responsibilities:

1. `lzc-manifest.yml`
   - Describes the stable runtime structure.
   - Dev-only logic is gated by `#@build` preprocessing blocks.
2. `package.yml`
   - Static package metadata.
3. `lzc-build.yml`
   - Release build config.
4. `lzc-build.dev.yml`
   - Dev override config with only the diff.

Common dev config:

```yml
pkg_id_suffix: dev

envs:
  - DEV_MODE=1

images:
  app-runtime:
    context: ./
    dockerfile: ./Dockerfile.dev
```

`envs` now means build-time variables only:

1. They are injected into `buildscript`.
2. They can be used by `#@build if env.KEY=VALUE`.
3. They are not written into the final LPK.

## 2. Default `project` behavior {#project-defaults}

If `lzc-build.dev.yml` exists, these commands prefer it by default:

1. `lzc-cli project deploy`
2. `lzc-cli project info`
3. `lzc-cli project start`
4. `lzc-cli project exec`
5. `lzc-cli project cp`
6. `lzc-cli project sync`
7. `lzc-cli project log`

Each command prints the active `Build config`.

Use `--release` when you want the release config explicitly.

## 3. Enable request inject only in dev mode {#dev-only}

Recommended pattern:

```yml
application:
  routes:
    - /=file:///lzcapp/pkg/content/dist
#@build if env.DEV_MODE=1
  injects:
    - id: frontend-dev-proxy
      on: request
      when:
        - "/*"
      do:
        - src: |
            // dev-only request inject
#@build end
```

This keeps release packages physically free of dev-only inject logic.

## 4. Frontend development {#frontend-dev}

Recommended order:

1. `lzc-cli project deploy`
2. `lzc-cli project info`
3. Open the app first
4. Then run `npm run dev`

The app page explains whether the dev machine is linked, online, and which port is expected.

## 5. Backend development {#backend-dev}

Recommended order:

1. `lzc-cli project deploy`
2. `lzc-cli project info`
3. Open the app first
4. Let the guide page tell you the next step if the backend is not ready
5. Then start sync and backend process

Typical loop:

```bash
lzc-cli project sync --watch
lzc-cli project exec /bin/sh
# inside container
/app/run.sh
```

Current template defaults:

1. `golang`
   - Dev mode does not auto-start the backend; the developer starts it manually.
2. `springboot`
   - Dev mode does not auto-start the backend.
3. `python`
   - Dev mode starts an extra `backend` service and request inject proxies entry traffic to that service.
   - The `backend` service executes `/app/run.sh` directly, so the app page usually enters the real business page automatically; if the backend is still not ready, the guide page remains the fallback.

## 6. Release flow {#release-workflow}

Release should stay minimal and stable:

1. Use `lzc-build.yml`
2. No `pkg_id_suffix`
3. No dev-only `#@build` branches
4. Images contain only final artifacts
5. `contentdir` is optional for image-only release packages

```bash
lzc-cli project release -o app.lpk
```
