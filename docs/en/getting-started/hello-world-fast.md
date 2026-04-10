# Hello World in 5 Minutes (Multi-Client Verification) {#hello-world-fast}

## Goal {#goal}

After this guide, you can clearly verify these 3 points:

1. A deployed app is mainly a Web App accessed over HTTPS.
2. `lpk` is the delivery and install package format for the app: code and runtime declarations are packed into `.lpk` and installed to the target microservice.
3. The same `.lpk` can be accessed consistently on Android, iOS, macOS, Windows, and Web browser.

## Prerequisites {#prerequisites}

1. You completed [Environment Setup](./env-setup.md).
2. `lzc-cli box default` already points to your target microservice.

## Steps {#steps}

### 1. Create project {#step-create-project}

Run in your workspace:

```bash
lzc-cli project create hello-lpk -t hello-vue
```

At the app id prompt, press Enter to use the default id or type your own.

```bash
cd hello-lpk
```

The template generates these core files by default:

1. `lzc-manifest.yml`: the app runtime description, including routes and entry behavior.
2. `package.yml`: static package metadata such as `package`, `version`, `author`, and `license`.
3. `lzc-build.yml`: the default build config and also the release config.
4. `lzc-build.dev.yml`: the dev override config, containing a dedicated dev package override such as `package_override.package: cloud.lazycat.app.helloworld.dev` and `DEV_MODE=1` by default.

This means `project deploy`, `project info`, `project exec`, and other `project` commands will target an isolated dev package by default, instead of overwriting the release package.
Each command prints the active `Build config` line, which tells you which build config file is actually in use; use `--release` when you want to operate on release explicitly.

### 2. Deploy first and confirm the entry URL {#step-first-deploy}

```bash
lzc-cli project deploy
lzc-cli project info
```

Notes:

1. On first deployment, if authorization is requested, open the URL printed by CLI in your browser.
2. `project` commands prefer `lzc-build.dev.yml` when it exists.
3. Each command prints the active `Build config` line.
4. `project deploy` runs the configured `buildscript`, so you do not need to run `npm install` separately first.
5. `project info` prints `Target URL` once the app is running.

### 3. Open the app first and read the page hint {#step-open-app-first}

1. Android/iOS: open Lazycat client and click the app icon in launcher.
2. macOS/Windows: open the desktop client and click the app icon in launcher.
3. Web: open the `Target URL` from `project info` in your browser.

For the `hello-vue` template, the first visit usually shows a frontend dev guide page. This is the expected behavior in this workflow, which means:

1. The entry flow is already controlled by the request routing script (`request inject`).
2. The page tells you the actual local port expected by the inject script.
3. If the dev server is not started yet, the page tells you the next step directly.

### 4. Start the frontend dev server {#step-start-dev-server}

After reading the page hint, run:

```bash
npm run dev
```

Then refresh the app page.

Traffic will still enter through the app URL, and the request routing script will proxy it to your dev machine frontend server.

### 5. Modify source and verify immediately {#step-modify-source}

Edit `src/App.vue` and change the title, for example:

```text
Welcome to Lazycat Microserver
```

to:

```text
Hello from my first LPK
```

Save the file and either refresh the page or wait for frontend hot reload.

For troubleshooting:

```bash
lzc-cli project log -f
```

### 6. Inspect lpk package (optional, recommended) {#step-inspect-lpk}

```bash
lzc-cli project release -o hello.lpk
lzc-cli lpk info hello.lpk
```

You should see fields like `format`, `package`, and `version`.
This helps confirm that `.lpk` is the package you finally deliver and install.

## Verification {#verification}

Pass conditions:

1. `lzc-cli project info` shows `Current version deployed: yes`.
2. `lzc-cli project info` shows `Project app is running.`.
3. On first open, you can see either the default page or the frontend dev guide page.
4. After `npm run dev` starts, both client and browser can enter the frontend page.
5. After editing `src/App.vue`, refreshing the page or waiting for hot reload shows the updated text.

## Troubleshooting {#troubleshooting}

### 1. `Project app is not running. Run "lzc-cli project start" first.` {#error-app-not-running}

Fix:

```bash
lzc-cli project start
```

### 2. `Target URL` missing {#error-target-url-missing}

Reason: app is not running, or the `app` container is not ready.

Fix:

```bash
lzc-cli project start
lzc-cli project info
```

### 3. The page says frontend dev server is not ready {#error-frontend-not-ready}

Check in order:

1. Confirm the port shown on the page.
2. Run `npm run dev` in the project directory.
3. Refresh the app page.
4. If it still fails, make sure the dev server is started on the same machine that ran `lzc-cli project deploy`.

## Next {#next}

Continue with: [Dev Workflow Overview](./dev-workflow.md)
