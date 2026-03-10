# lzc-build.yml Specification

## 1. Overview

Build config is split into only two layers:

1. `lzc-build.yml`: the default build config and also the release config.
2. `lzc-build.dev.yml`: an optional dev override file that only keeps diffs relative to release.

Recommended command defaults:

1. `lzc-cli project deploy`: prefers `lzc-build.dev.yml`, otherwise falls back to `lzc-build.yml`.
2. `lzc-cli project info/start/exec/cp/log/sync`: follow the same rule by default.
3. `lzc-cli project release`: always uses `lzc-build.yml`.
4. `lzc-cli project build`: uses `lzc-build.yml` by default, unless `-f` is specified.
5. Every `project` command prints the active `Build config`; use `--release` when you want the release config explicitly.

## 2. Top-level `BuildConfig`

### 2.1 Basic fields {#basic-config}

| Field | Type | Description |
| ---- | ---- | ---- |
| `buildscript` | `string` | Path to a build script or a direct shell command |
| `manifest` | `string` | Path to `lzc-manifest.yml` |
| `contentdir` | `string` | Optional content directory. If omitted, no `content.tar` / `content.tar.gz` is generated |
| `pkgout` | `string` | Output directory for the built LPK |
| `icon` | `string` | Icon path. PNG only |
| `pkg_id_suffix` | `string` | Optional package suffix added at build time, such as `org.example.demo.dev` |
| `envs` | `[]string` | Optional build-time variable list using `KEY=VALUE` strings |
| `images` | `map[string]ImageBuildConfig` | Dockerfile-based image build config for `embed:<alias>` |
| `compose_override` | `ComposeOverrideConfig` | Advanced compose override config, requires `lzc-os >= v1.3.0` |

### 2.2 Recommended file layout {#file-layout}

```text
.
├── lzc-build.yml
├── lzc-build.dev.yml
├── lzc-manifest.yml
└── package.yml
```

Guidelines:

1. `lzc-build.yml` stores the default and release build config.
2. `lzc-build.dev.yml` stores dev-only diffs, such as:
   - `pkg_id_suffix: dev`
   - dev-only `buildscript`
   - dev-only `envs`
3. For image-only release packages, `contentdir` can be omitted entirely.
4. Do not copy the full config into `lzc-build.dev.yml`; keep only the diff.

## 3. Build-time variables `envs` {#envs}

`envs` is a build-time variable list only.

Behavior:

1. `envs` must be an array of `KEY=VALUE` strings.
2. `KEY` must match `^[A-Za-z_][A-Za-z0-9_]*$`.
3. Duplicate keys are not allowed.
4. These variables are injected into the `buildscript` process environment.
5. They are also available to manifest build preprocessing.
6. They are not written into the final LPK and are not used by deploy-time manifest render.

Example:

```yml
# lzc-build.dev.yml
pkg_id_suffix: dev
envs:
  - DEV_MODE=1
  - FRONTEND_PORT=3000
```

## 4. Manifest build preprocessing {#manifest-build}

Before packaging, `lzc-manifest.yml` is passed through a lightweight build preprocessor.

Directives must be written in YAML comments using the fixed form `#@build <directive>`.

The current directives are intentionally minimal:

1. `#@build if profile=dev`
2. `#@build if env.DEV_MODE=1`
3. `#@build else`
4. `#@build end`
5. `#@build include ./relative/path.yml`

Evaluation rules:

1. `if` starts a conditional block and remains active until the matching `else` or `end`.
2. `else` is optional and only keeps the following text when the `if` branch does not match.
3. `end` closes the current conditional block.
4. `profile=dev` / `profile=release` matches the current build profile.
5. `env.KEY=VALUE` performs an exact string comparison against build-time variables from `build.yml:envs`; missing keys do not match.
6. Build preprocessing runs before packaging, so it only decides which text is copied into the final `manifest.yml`.
7. Deployment-time manifest render still only evaluates `.U` / `.S`; it does not process `#@build`.

Constraints:

1. `include` only supports plain text fragments.
2. Included files must not contain further `#@build` directives.
3. Include paths are resolved relative to the main `lzc-manifest.yml`.
4. Build preprocessing decides which text exists in the final `manifest.yml`; deploy-time render still only resolves `.U` and `.S`.
5. `#@build` is meant for dev/release text selection, not deployment-time dynamic logic.

Example:

```yml
#@build if env.DEV_MODE=1
application:
  injects:
    - id: frontend-dev-proxy
      on: request
      when:
        - "/*"
      do:
        - src: |
            if (ctx.dev.id) {
              ctx.proxy.to("http://127.0.0.1:3000", {
                via: ctx.net.via.client(ctx.dev.id),
                use_target_host: true,
              });
            }
#@build else
application:
  routes:
    - /=file:///lzcapp/pkg/content/dist
#@build end
```

`include` example:

```yml
application:
  routes:
    - /=file:///lzcapp/pkg/content/dist
#@build if profile=dev
#@build include ./manifest.dev.inject.yml
#@build end
```

## 5. Image build `ImageBuildConfig` {#images}

`images` builds Docker images during packaging and generates the `images/` and `images.lock` layout required by LPK v2.

The key of `images` is the alias referenced by `embed:<alias>` in `lzc-manifest.yml`.

| Field | Type | Description |
| ---- | ---- | ---- |
| `dockerfile` | `string` | Optional Dockerfile path; mutually exclusive with `dockerfile-content` |
| `dockerfile-content` | `string` | Optional inline Dockerfile content; mutually exclusive with `dockerfile` |
| `context` | `string` | Optional build context directory |
| `upstream-match` | `string` | Optional upstream image prefix, default `registry.lazycat.cloud` |

## 6. Advanced compose override {#compose-override}

1. `compose_override` is supported by `lzc-cli >= 1.2.61`.
2. It is intended for runtime permissions or compose fields that are not yet covered by the current LPK spec.

See [compose override](./advanced-compose-override.md).
