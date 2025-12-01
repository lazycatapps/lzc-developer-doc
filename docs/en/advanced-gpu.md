# GPU Acceleration
When we develop multimedia applications, GPU acceleration is very critical. Enabling GPU acceleration for applications is simple. You only need to add a `gpu_accel: true` sub-field under the `application` field in the `lzc-manifest.yml` file, for example:

```yml
application:
  gpu_accel: true
```
