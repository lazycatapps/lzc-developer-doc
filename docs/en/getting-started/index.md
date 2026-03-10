# New Getting Started Path {#getting-started-overview}

This section is for developers building their first LPK. The goal is to complete one real deployment as quickly as possible:

1. Deploy successfully and verify it from multiple clients.
2. Understand the dev workflow and the split between frontend development, backend development, and release.
3. Add backend logic and HTTP routing.
4. Understand the LPK mechanism and embedded image workflow.

## Scope {#scope}

- You are new to Lazycat microservice app development.
- You want a "run first, then understand" path.
- You use `lzc-cli` for local development and deployment.

## Learning Path {#learning-path}

| Stage | Document | Outcome |
| --- | --- | --- |
| 1 | [Environment Setup](./env-setup.md) | Local environment works and `lzc-cli` can reach your target microservice |
| 2 | [Hello World in 5 Minutes](./hello-world-fast.md) | First app is deployed and visible on Android/iOS/macOS/Windows/Web |
| 3 | [Dev Workflow Overview](./dev-workflow.md) | Understand how `lzc-build.dev.yml`, `request` inject, and `project sync --watch` form one development workflow |
| 4 | [HTTP Routing with Backend](./http-route-backend.md) | Understand `application.routes` and the boundary of frontend/backend integration |
| 5 | [How LPK Works](./lpk-how-it-works.md) | Build a complete mental model of build/package/install flow |
| 6 | [Advanced Embedded Image Practice](./advanced-vnc-embed-image.md) | Use `images` + `embed:<alias>` with `gui-vnc` for upstream image customization |

## What To Prepare {#what-to-prepare}

1. A device with Lazycat microservice client installed.
2. A reachable target microservice (LAN or Internet).
3. A local Node.js development environment.

## Success Criteria {#success-criteria}

After this section, you should be able to:

1. Create and deploy an LPK project independently.
2. Understand that `project` commands prefer `lzc-build.dev.yml` by default and confirm the target with the printed `Build config` line.
3. Understand how frontend development proxies to the dev machine through `request` inject, and how backend development lands in the real runtime through `project sync --watch`.
4. Verify app availability both in client apps and browser.
5. Configure HTTP routes correctly when backend is needed.
6. Use embedded image workflow for image customization.
7. Generate a distributable `.lpk` with `lzc-cli project release`.
