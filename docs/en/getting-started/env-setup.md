# Developer Environment Setup {#env-setup}

## Goal {#goal}

After this guide, your local machine can use `lzc-cli` to connect to the target microservice and is ready for build/deploy tasks.

## Prerequisites {#prerequisites}

1. You have a reachable Lazycat microservice.
2. Your account can log in to the Lazycat client.
3. `node` and `npm` are available in your terminal.

## Steps {#steps}

### 1. Install dependencies {#step-install-dependencies}

1. Install Node.js 18+ (LTS recommended).
2. Install and sign in to the Lazycat client.
3. Install "Lazycat Developer Tool" from App Store on your microservice.

### 2. Install lzc-cli {#step-install-lzc-cli}

```bash
npm install -g @lazycatcloud/lzc-cli
lzc-cli --version
```

If `lzc-cli --version` prints a version, installation is successful.

### 3. Prepare SSH key (first time only) {#step-prepare-ssh-key}

For Linux/macOS/Git Bash:

```bash
[ -f ~/.ssh/id_ed25519.pub ] || ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
```

### 4. Select default target microservice {#step-select-default-target}

```bash
lzc-cli box list
lzc-cli box switch <boxname>
lzc-cli box default
```

Replace `<boxname>` with your own target microservice name.

Notes:

1. If you are not in WSL/LightOS-like environments and only have one microservice, you can skip this step.
2. If you have multiple microservices, use `lzc-cli box switch <boxname>` to pin the current target.
3. In WSL/LightOS-like environments, you can add target via SSH:

```bash
lzc-cli box add-by-ssh <loginUser> <address>
```

This requires SSH to be enabled on target microservice.

### 5. Upload public key to Developer Tool (first time for hclient mode only) {#step-upload-public-key}

Only for hclient-based access:

```bash
lzc-cli box add-public-key
```

The command prints an authorization URL. Open it in browser and finish authorization.

If your target is added with `lzc-cli box add-by-ssh <loginUser> <address>`, skip this step.  
`add-by-ssh` mode does not need and cannot use `lzc-cli box add-public-key`.

### 6. Create local workspace directory {#step-create-workspace}

```bash
mkdir -p <your-workspace-dir>
```

## Verification {#verification}

Run:

```bash
lzc-cli --version
lzc-cli box default
lzc-cli project --help
```

Pass conditions:

1. `lzc-cli` version is shown.
2. `box default` shows your default microservice.
3. `project --help` includes commands like `deploy/start/info/exec/cp/log/release`.

## Troubleshooting {#troubleshooting}

### 1. `No default box configured` {#error-no-default-box}

Reason: default microservice is not configured.

Fix:

```bash
lzc-cli box list
lzc-cli box switch <boxname>
```

### 2. `permission denied (publickey)` {#error-publickey-denied}

Reason: your SSH public key is not accepted by target microservice (common in `add-by-ssh` mode).

Fix:

1. If you use hclient mode, run `lzc-cli box add-public-key` and complete browser authorization.
2. If you use `add-by-ssh` mode, do not use `box add-public-key`; check SSH public key authorization on target.

### 3. `lzc-cli: command not found` {#error-cli-not-found}

Reason: global npm bin path is not in PATH.

Fix: add npm global bin path to your shell PATH, or reopen the terminal.

## Next {#next}

Continue with: [Hello World in 5 Minutes](./hello-world-fast.md)
