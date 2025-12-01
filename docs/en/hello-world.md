# Hello World
Please follow the steps below to build our first application together.

First, use lzc-cli to create a project named `helloworld`:

```bash
lzc-cli project create helloworld
```

After completing initialization according to the prompts, the terminal will output the following:

```bash
? Select project build template vue3
? Please enter application ID, such as (helloworld) helloworld
✨ Initializing project helloworld
✨ Initializing LCMD Cloud application
✨ LCMD MicroServer application created successfully!
✨ After the following steps, you can enter container development
   cd helloworld
   lzc-cli project devshell
⚙️  After entering the application container, execute the following commands:
   npm install
   npm run dev
🚀 Start application:
   Enter the LCMD client launcher page and click the application icon to test the application
```

Then execute the following command to enter the container development environment:

```bash
cd helloworld
lzc-cli project devshell
```

After successfully entering the container, the terminal will display the following information:

```bash
[info] Starting application deployment
[info] Installation successful!
[info] 👉 Please access https://helloworld.178me.heiyu.space in your browser
[info] 👉 Login with LCMD username and password
```

Execute the following commands in the container to start the application:

```bash
npm install
npm run dev
```

The frontend service will run on port 3000 of the container:

```bash
Local:   http://localhost:3000/
Network: http://172.31.0.36:3000/
```

At this point, the application service has started. You can click the "helloworld" icon on PC or mobile to see the application's effect on each terminal platform.

A major advantage of LCMD MicroServer is that you only need to write JavaScript once, and we automatically solve the problem of cross-platform operation of applications on 6 operating system platforms: Windows/Linux/macOS/Android/iOS/HarmonyOS, saving developers a lot of time on platform adaptation.

If you want to deploy this Hello World to LCMD MicroServer, you can refer to [Building Application](https://developer.lazycat.cloud/app-example-python.html#构建应用).
