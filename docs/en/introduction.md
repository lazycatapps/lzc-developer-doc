# What is Lzc-SDK?

Lzc-SDK is the SDK provided by the LCMD MicroServer platform, enabling developers to interact with system and application states, create more fun and interesting applications, and publish them to the LCMD MicroServer store.

Using Lzc-SDK, developers can focus on building innovative applications without worrying about server setup, backend logic, API design, or network security. The SDK simplifies the development process, allowing you to create and deploy applications with just a few function calls.

The SDK supports multiple programming languages, including APIs required for system layer, application layer, and client layer, allowing developers to comprehensively extend LCMD MicroServer.

::: info
Currently supports Go, Javascript/Typescript. More language versions will be provided in the future, such as Rust, Dart, Cpp, Java, Python, Ruby, C#, PHP, Objective-C, Kotlin. Stay tuned...
:::

## Extensions

For some common scenarios, the LCMD MicroServer platform also provides the following extensions:
  - [lzc-minidb](https://www.npmjs.com/package/@lazycatcloud/minidb), a small database similar to MongoDB type, convenient for developers to directly develop Serverless applications.
  - [lzc-file-pickers](https://www.npmjs.com/package/@lazycatcloud/lzc-file-pickers), a file picker in LCMD MicroServer, allowing your application to directly open files in LCMD.

::: info
Currently provided extensions are all Javascript/Typescript, convenient for web use. If they don't meet your needs, please provide feedback, and we will add them as soon as possible. :)
:::

## Javascript Example
The Javascript(Typescript) SDK is distributed using npm, and you need to install the corresponding npm package in your project.

```bash
npm install @lazycatcloud/sdk
# or
pnpm install @lazycatcloud/sdk
```

The JS/TS version uses [grpc-web](https://github.com/improbable-eng/grpc-web) to provide services. Below is an example of getting all application lists:

```js
import { lzcAPIGateway } from "@lazycatcloud/sdk"

// Initialize lzcapi
const lzcapi = new lzcAPIGateway(window.location.origin, false)

// Use lzcapi to call package manager service to get all application lists
const apps = await lzcapi.pkgm.QueryApplication({ appidList: [] })

console.debug("applicatons: ", apps)
```

::: info
```js
{
  "infoList": [
    {
      "appid": "cloud.lazycat.developer.tools",
      "status": 4,
      "version": "0.1.3",
      "title": "LCMD Cloud Developer Tools",
      "description": "",
      "icon": "//lcc.heiyu.space/sys/icons/cloud.lazycat.developer.tools.png",
      "domain": "dev.lcc.heiyu.space",
      "builtin": false,
      "unsupportedPlatforms": []
    }
  ]
}
```
:::

With just a few steps, you can easily interact with LCMD. For detailed API documentation, please see [LzcSDK API(JavaScript)](./api/javascript.md).

## Go Example

Go natively supports [grpc-go](https://github.com/grpc/grpc-go), and LzcSDK also provides corresponding [support](https://pkg.go.dev/gitee.com/linakesi/lzc-sdk/lang/go).

Below uses a few lines of code to quickly experience the ability to interact with the LCMD ecosystem.

First, you need to install Lzc SDK dependencies in your project:

```shell
go get -u gitee.com/linakesi/lzc-sdk/lang/go
```

Then you can call the APIs provided by the SDK with just a few simple steps.

```go
package main

import (
	lzcsdk "gitee.com/linakesi/lzc-sdk/lang/go"
	"gitee.com/linakesi/lzc-sdk/lang/go/common"
)

func main(){
	ctx := context.TODO()
	// Initialize LzcAPI
	lzcapi, err := lzcsdk.NewAPIGateway(ctx)
	if err != nil {
		fmt.Println("Initial Lzc Api failed:", err)
		return
	}
	// Build request content, indicating to get all devices of the user "lazycat"
	request := &common.ListEndDeviceRequest{
		Uid: "lazycat"
	}
	// Get all devices of lazycat user
	devices, err := lzcAPI.Devices.ListEndDevices(ctx, request)
	if devices == nil {
		fmt.Println("lazycat has no devices")
		return
	}
	var onLineDevices []*common.EndDevice
	for _, device := range devices.Devices {
		d := device
		// Check if device is online
		if d.IsOnline {
			onLineDevices = append(onLineDevices, d)
			fmt.Printf("%s device is online\n", d.Name)
			}
	}
    fmt.Printf("There are %d online devices\n", len(onLineDevices))
}
```

:::info
```txt:no-line-numbers
evan device is online
wwh device is online
There are 2 online devices
```
:::

Calling the SDK's API is very simple and natural. For more detailed APIs, please refer to [LzcSDk API(Golang)](./api/golang.md).
