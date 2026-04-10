# Hello World

Use the shortest path to build your first deployable app.

## 1. Create project

```bash
lzc-cli project create helloworld
```

In the interactive prompt:

1. Choose `hello-vue`.
2. Keep the default app id `helloworld`, or type your own.

After creation, you should see a message like this:

```bash
✨ Initialize project helloworld
✨ Lazycat app initialized
✨ First deploy and open the app once
   cd helloworld
   lzc-cli project deploy
   lzc-cli project info
```

Inside the project directory, the key files are:

1. `lzc-manifest.yml`: runtime structure and routes.
2. `package.yml`: static package metadata such as `package`, `version`, `author`, and `license`.
3. `lzc-build.yml`: default build config and also the release config.
4. `lzc-build.dev.yml`: dev override config, usually containing a dedicated dev package override such as `package_override.package: cloud.lazycat.app.helloworld.dev` and build-time `envs`.

In daily development, `project deploy`, `project info`, `project exec`, and other `project` commands prefer `lzc-build.dev.yml` by default, so they operate on an isolated dev package instead of overwriting release.
Each command prints the active `Build config`. Use `--release` when you explicitly want `lzc-build.yml`.

## 2. Deploy first, then open the app

```bash
cd helloworld
lzc-cli project deploy
lzc-cli project info
```

Notes:

1. If the first deployment asks for authorization, open the URL printed by CLI and finish authorization in the browser.
2. `project` commands prefer `lzc-build.dev.yml` when it exists, and each command prints the active `Build config`.
3. `project deploy` runs the configured `buildscript`, so you do not need to run `npm install` separately first.
4. `project info` prints `Target URL` when the app is running.
5. Use `--release` if you want to inspect or operate on release config.
6. If the app is not running yet, run:

```bash
lzc-cli project start
lzc-cli project info
```

Then open the app directly:

1. Click the app icon from the Lazycat client launcher.
2. Or open the `Target URL` in your browser.

For the `hello-vue` template, the app page usually enters the dev-mode entry first:

1. If the local frontend dev server is not started yet, the page tells you the next step directly.
2. The page shows the exact local port expected by the inject script.
3. You do not need to guess commands or edit manifest first.

## 3. Start frontend development from the page hint

After opening the app page, run:

```bash
npm run dev
```

Then refresh the app page.

From then on, changes to files such as `src/App.vue` are still reached through the official LPK domain, and request inject proxies traffic to your local dev server.

For troubleshooting:

```bash
lzc-cli project log -f
```

## 4. Build release package

```bash
lzc-cli project release -o helloworld.lpk
```

Install the release package:

```bash
lzc-cli lpk install helloworld.lpk
```

`project release` always uses `lzc-build.yml`, without dev-only package suffix or dev-only `#@build` branches.
