# LPK Format

This document describes the current LPK v1 / v2 file layout, field boundaries, and compatibility rules.

## 1. Top-level layout

Typical LPK root:

```text
.
├── manifest.yml
├── package.yml
├── content.tar | content.tar.gz
├── images/
├── images.lock
└── META/
```

Notes:

1. `manifest.yml`
   - Runtime structure definition.
2. `package.yml`
   - Static package metadata.
3. `content.tar` / `content.tar.gz`
   - Optional content archive.
4. `images/` and `images.lock`
   - Embedded image data for LPK v2.
5. `META/`
   - Archive metadata.

## 2. `manifest.yml`

`manifest.yml` only describes runtime structure, such as:

- `usage`
- `application`
- `services`
- `ext_config`

Rules:

1. The source manifest may go through `#@build` preprocessing at build time.
2. The file packaged into the final LPK must be the preprocessed `manifest.yml`.
3. Deploy-time render only resolves deploy-time inputs such as `.U` / `.S`.
4. For LPK v2, these static fields should no longer live in `manifest.yml`:
   - `package`
   - `version`
   - `name`
   - `description`
   - `locales`
   - `author`
   - `license`
   - `homepage`
   - `min_os_version`
   - `unsupported_platforms`

## 3. `package.yml`

`package.yml` stores static package metadata.

Current fields:

```yml
package: cloud.lazycat.app.demo
version: 0.0.1
name: Demo
description: Demo app
locales:
  en:
    name: Demo
    description: Demo app
author: demo
license: MIT
homepage: https://example.com
min_os_version: 1.0.0
unsupported_platforms:
  - ios
```

Rules:

1. LPK v2 (tar format) must include `package.yml`.
2. LPK v1 (zip format) keeps backward compatibility and may still keep these static fields in `manifest.yml`.
3. New projects should move static metadata into `package.yml`.
4. `locales` keeps the same meaning; only its storage location moves from `manifest.yml` to `package.yml`.

## 4. `content.tar` / `content.tar.gz`

Rules:

1. Content archives are generated only when `contentdir` is configured, or when build hooks actually write content.
2. Image-only release packages may omit `content.tar*` completely.
3. Tar-based LPK v2 may use `content.tar.gz` when embedded images are present.

## 5. `images/` and `images.lock`

These files are used by LPK v2 embedded image distribution.

Rules:

1. `images/` stores an OCI layout.
2. `images.lock` records alias, final digest, and upstream information.
3. `embed:<alias>@sha256:<digest>` references in `manifest.yml` must match `images.lock`.

## 6. Compatibility

1. zip / v1 keeps backward compatibility and may still place static fields in `manifest.yml`.
2. tar / v2 requires `package.yml` and follows the current v2 image rules.
3. After `lzc-os/pkgm` installs either V1 or V2, the runtime directory `/lzcsys/data/system/pkgm/run/<deploy_id>/pkg/` is normalized to the V2 layout:
   - `manifest.yml` keeps runtime structure only
   - `package.yml` stores static metadata
