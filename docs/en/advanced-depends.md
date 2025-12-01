# Service Startup Dependencies

lzcapp provides two fields related to service dependencies to handle timing issues during application startup

1. Simplified `depends_on` field
2. Health check mechanism automatically injected based on `application.routes` field

depends_on
===========

In most cases, `depends_on` only needs to be used under the `services.$service_name` field, type is `[]string`
Each entry fills in a `$service_name`, the current service will wait for all services in `depends_on` to have container status as `healthy` when starting

The `service.$service_name.health_check` field will affect the service entering `healthy` state. This field has the same semantics as docker-compose's healthCheck,
but only supports the following 4 fields
```go
type HealthCheckConfig struct {
	Test        []string      `yaml:"test"`
	TestUrl     string        `yaml:"test_url"`
	StartPeriod time.Duration `yaml:"start_period"`
	Disable     bool          `yaml:"disable"`
}
```

health_check 示例:
```yml
services:
  wordpress:
    image: bitnami/wordpress:5.8.2
    health_check:
        test:
            - CMD-SHELL
            - "curl -f http://localhost:80/ || exit 1"
        # test_url: http://localhost:80 # 进行健康检查的 url，如果返回大于 500 则健康检查失败
        start_period: 190s
        disable: false
```

::: warning
> 1. lzcapp 中的对应字段为 `health_check` 而非 `healthCheck`
> 2. 即使 service 中没有填写 `health_check` 也会受 docker image 中对应字段影响
:::

Automatically Injected Health Checks
===============

lzcapp mainly provides services externally through `application.routes`, so the system will automatically perform intelligent detection based on the upstream state in routes.
Therefore, in most cases, there is no need to manually handle dependencies. The specific rules are as follows:

1. Detect and wait for all service containers to enter running state
2. Detect and wait for the corresponding service in `application.health_check.test_url` to return 200 status (if this configuration exists)
3. Detect and wait for all upstreams to be ready, then the special service `application` enters healthy state
   The specific method is to scan all routes rules and extract the `http://$hostname:$port` part. exec type will be automatically converted to `http://127.0.0.1:$port`
   Use TCP dial `$hostname:$port`, if dial succeeds, it indicates that this upstream is ready
4. Wait for all other services to enter healthy state, the "Application starting" page switches to actual service content

::: warning
> 1. If `$hostname` is a public IP/domain, step 3 will ignore this upstream service to avoid LCMD being unable to start this application without internet
> 2. When dialing `$hostname:$port`, HTTP method is not used, because some upstreams are in 404 or other strange states when normal
>   Therefore, the automatically injected detection logic only ensures TCP level is normal
> 3. Due to the existence of automatic injection, never fill in the special service_name `app` in `services.$service_name.depends_on`
> 4. If you encounter dependency-related issues during development, you can set `application.health_check.disable=true` to disable automatically injected health checks, but it is strongly recommended to enable it when officially releasing the application
:::
