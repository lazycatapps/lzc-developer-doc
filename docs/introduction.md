# Lzc SDK是什么?
懒猫微服平台提供操作，获取系统和应用状态功能的接口。

开发者基于开放的接口创造出有趣的应用程序，并通过SDK提供的工具上架到懒猫微服商店。

使用懒猫微服SDK无须关心服务器的搭建，内部后端逻辑，接口设计，网络安全等繁杂的技术知识，只需要调用几个函数，你的应用就能跑起来并发布到公共商店中。

SDK支持多种编程语言的支持，包含系统层，应用层，客户端层所需API，允许开发者全方位扩展懒猫微服。

::: details
目前支持 Go、Javascript/Typescript，后续会提供更多语言版本，例如 Rust、Dart、Cpp、Java、Python、Ruby、C#、PHP、Objective-C、Kotlin 敬请期待...
:::

## Javascript示例
Javascript(Typescript)的SDK使用npm分发，需要在你的项目中安装对应的npm包。
```bash
npm install @lazycatcloud/sdk
# 或者
pnpm install @lazycatcloud/sdk
```

JS/TS版本是使用[grpc-web](https://github.com/improbable-eng/grpc-web)提供服务，下面提供了一个获取所有应用列表的示例:
```js
import { lzcApiGateway } from "@lazycatcloud/sdk"

// 初始化lzcapi
const lzcapi = new lzcApiGateway(window.location.origin, false)

// 使用lzcapi调用package manager服务以获取所有应用列表
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
      "title": "懒猫云开发者工具",
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

简单几步，就可以很方便的和微服进行交互，详细的API文档请查看[LzcSDK API(JavaScript)](./api/javascript.md)。

## Go示例

Go原生支持[grpc-go](https://github.com/grpc/grpc-go)，LzcSDK也提供了对应的[支持](https://pkg.go.dev/gitee.com/linakesi/lzc-sdk/lang/go)。

下面使用几行代码快速体验和微服生态交互的能力。

首先需要先在项目里安装Lzc SDK的依赖:

```shell
go get -u gitee.com/linakesi/lzc-sdk/lang/go
```

随后只需要简单几步，即可调用SDK提供的API了。

```go
package main

import (
	lzcsdk "gitee.com/linakesi/lzc-sdk/lang/go"
	"gitee.com/linakesi/lzc-sdk/lang/go/common"
)

func main(){
	ctx := context.TODO()
	// 初始化LzcAPI
	lzcapi, err := lzcsdk.NewAPIGateway(ctx)
	if err != nil {
		fmt.Println("Initial Lzc Api failed:", err)
		return
	}
	// 构建请求内容，表示要获取lazycat这个用户的所有设备
	request := &common.ListEndDeviceRequest{
		Uid: "lazycat"
	}
	// 获取lazycat用户所有设备
	devices, err := lzcAPI.Devices.ListEndDevices(ctx, request)
	if devices == nil {
		fmt.Println("lazycat没有任何设备")
		return 
	}
	var onLineDevices []*common.EndDevice
	for _, device := range devices.Devices {
		d := device
		// 判断设备是否在线
		if d.IsOnline {
			onLineDevices = append(onLineDevices, d)
			fmt.Printf("%s 设备在线\n", d.Name)
			}
	}
    fmt.Printf("在线的设备共有%d个\n", len(onLineDevices))
}
```

:::info
```txt:no-line-numbers
evan 设备在线
wwh 设备在线
在线的设备共有2个
```
:::

调用SDK的API十分简单自然，更详细的API请参阅[LzcSDk API(Golang)](./api/golang.md)。
