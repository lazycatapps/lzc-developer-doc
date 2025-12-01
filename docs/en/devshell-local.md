# devshell Local Development Configuration

The Hello World example explains how to develop applications in LCMD. You only need to edit the source code in the remote terminal, and Vue will automatically build a new page preview service.

However, editing code directly on the remote server is not that convenient. In local mode, you only need to edit the source code on your local PC, and LCMD will sync the source code to the server and automatically build it. Compared to cloud code editing, it is more efficient.

The switching method is very simple. Take the `helloworld` project as an example, open the file in `lzc-build.yml` in the project, and find the devshell/routes section:

```yaml
devshell:
  routes: # This field will be merged into lzc-manifest.yml, the final result can be viewed by entering devshell and then cat /lzcapp/pkg/manifest.yml
    - /=http://127.0.0.1:3000
```

Forward the entire route to your development machine's LAN IP. This IP needs to ensure that it can be directly accessed by LCMD

```yaml
devshell:
  routes:
    - /=http://${DEVELOPMENT_MACHINE_LAN_IP}:3000
```

After modification, execute the following command in the terminal to rebuild the container:
```bash
cd helloworld
lzc-cli project devshell -f
```

Then execute in the local terminal (note: local terminal, not cloud terminal):
```bash
cd helloworld
npm install
npm run dev
```

After completing the above configuration, you only need to modify the code locally, and the application image will be automatically built and updated in the cloud. Then click the application icon again, and you can see the new effect!
