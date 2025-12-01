# Database Service

## Starting Database Service
When you need to start a database service like MySQL, you only need to add the following content to the `lzc-manifest.yml` file. LCMD will automatically start a database container to provide database read and write services externally, defaulting to listening on port `3306`.

```yml
services:
  mysql:
    image: registry.lazycat.cloud/mysql
    binds:
      - /lzcapp/var/mysql:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=LAZYCAT
      - MYSQL_DATABASE=LAZYCAT
      - MYSQL_USER=LAZYCAT
      - MYSQL_PASSWORD=LAZYCAT
```

Detailed configuration explanation:
- `mysql`: Name of the database Docker service
- `image`: Address to download MySQL Docker from LCMD MicroServer
- `binds`: When MySQL writes data to `/var/lib/mysql`, the LCMD system will automatically bind to the `/lzcapp/var/mysql` path of the application container
- `environment`: Define environment variables required for MySQL startup

## Connecting to Database Service
Once the database service is started, access is also simple. You can access it through `mysql.package.lzcapp:3306`.

For example, if the application's `package` is `cloud.lazycat.app.todolistpy`, you only need to access `mysql.cloud.lazycat.app.todolistpy.lzcapp:3306` in the code to freely read and write MySQL.

## Other Database Services
When you need to start a database service like PostgreSQL, you only need to add the following content to the `lzc-manifest.yml` file. LCMD will automatically start a database container to provide database read and write services externally, defaulting to listening on port `5432`.

```yml
services:
  postgresql:
    image: registry.lazycat.cloud/postgres:18.1
    environment:
      - POSTGRES_USER=lazycat
      - POSTGRES_PASSWORD=lazycat
      - POSTGRES_DB=lazycat
    binds:
      - /lzcapp/var/pgdata:/var/lib/postgresql
```
When you need to start a database service like Redis, you only need to add the following content to the `lzc-manifest.yml` file. LCMD will automatically start a database container to provide database read and write services externally, defaulting to listening on port `6379`.

```yml
services:
  redis:
    image: registry.lazycat.cloud/redis:8.0
    command: redis-server --appendonly yes
```
