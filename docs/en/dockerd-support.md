# Docker Support

If you need to run Docker, Docker Compose, or maintain containers in a traditional NAS-style workflow on the microserver, use [LightOS](./advanced-lightos.md).

LightOS is suitable for long-lived complete Linux runtime environments. Users can install the LightOS entry app from the app store, create an instance, and then install and use Docker inside that instance using the normal Linux workflow. Software, configuration, and Docker data inside the instance are persisted with the LightOS instance.

If the goal is to distribute a standalone app to normal microserver users, build an LPK first. Docker in LightOS is more suitable for personal development, debugging, operations, and self-hosted services.
