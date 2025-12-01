# Application Internal Domain Rules

Although lzcapp runs in independent containers, multiple services within lzcapp can access each other. Below is an introduction to the domain rules for each service within the application.

## Service Domain Construction Rules
Each container's service access follows a specific domain format to ensure service isolation and access control.

### Single-Instance (Single-User) Applications
In **single-instance applications**, access between services is done through the following domain format:
```
${service_name}.${lzcapp_appid}.lzcapp
```

- `${service_name}`: Service name inside the container.

- `${lzcapp_appid}`: Application's unique ID.

- `.lzcapp`: Fixed top-level domain.

Example:
```
db.example.app.id.lzcapp
^^ ^^^^^^^^^^^^^^
||  |_____________${lzcapp_appid}
||
||________________${service_name}
```

### Multi-Instance (Multi-User) Applications
If the application supports **multi-user instances**, you can access a specific user's instance through the following format:
```
${userId}.${service_name}.${lzcapp_appid}.lzcapp
```
- `${userId}`: User ID, used to identify the user's instance.

Example:
```
user42.db.example.app.id.lzcapp
```
Indicates that `user42` accesses the db service in `lzcapp_appid = example.app.id`.

### Special Domains

- **`host.lzcapp`**

This domain will resolve to the lzc-docker bridge.
When lzcapp services use `host` [network mode](./spec/manifest.md#71-容器配置-container-config). Containers in the service can
listen on `host.lzcapp` so that other applications can access this service.

- **`_outbound`**

This domain will resolve to LCMD MicroServer's default egress IP.

- **`_gateway`**

This domain will resolve to the gateway of the network where LCMD MicroServer is located.

:::tip Inter-Application Network Isolation

Before lzcos-1.3.x, networks between applications were not completely isolated. After isolation, using the corresponding service domain can still obtain IP addresses, but cannot access.

:::
