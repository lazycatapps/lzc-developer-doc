deploy-params
=============

`lzc-deploy-params.yml` is a configuration file for developers to define installation parameters. This document will describe its structure and the meaning of each field in detail.

# DeployParams

| Field Name | Type | Description |
| ---- | ---- | ---- |
| `params` | `[]DeployParam` | List of deployment parameters defined by developers |
| `locales` | `map` | Internationalization related |

-------------------------------

# DeployParam
| Field Name | Type | Description |
| ---- | ---- | ---- |
| `id` | `string` | Unique ID within the application, for internationalization and reference in manifest.yml |
| `type` | `string` | Field type, currently supports `bool`, `lzc_uid`, `string`, `secret` |
| `name` | `string` | Name when rendering the field, supports internationalization |
| `description` | `string` | Detailed description when rendering the field, supports internationalization |
| `optional` | `bool` | Whether this field is optional. If optional, users will not be forced to fill it in. If all fields are optional, the deployment interface will be skipped directly |
| `default_value` | `string` | Default value provided by the developer, supports `$random(len=5)` (lzcos 1.5.0+) |
| `hidden` | `bool` | Field still takes effect, but is not rendered in the interface |
