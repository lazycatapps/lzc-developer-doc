FROM alpine:latest

ARG ALPINE_VERSION=v3.16

RUN printf 'https://mirrors.cqu.edu.cn/alpine/%s/main\nhttps://mirrors.cqu.edu.cn/alpine/%s/community\n' "$ALPINE_VERSION" "$ALPINE_VERSION" | \
    install -Dm644 /dev/stdin /etc/apk/repositories
RUN apk update

RUN apk add nginx

# install ui
COPY /docs/.vitepress/dist /usr/share/nginx/html

# configure
COPY /deploy/nginx.conf /etc/nginx/nginx.conf

# configure
EXPOSE 80

# entrypoint
COPY /deploy/docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT [ "/docker-entrypoint.sh" ]

