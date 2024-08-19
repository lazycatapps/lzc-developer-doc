FROM alpine:latest

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && \
    apk update && \
    apk add --no-cache nginx

# install ui
COPY /docs/.vitepress/dist /usr/share/nginx/html

# configure
COPY /deploy/nginx.conf /etc/nginx/nginx.conf

# configure
EXPOSE 80

# entrypoint
COPY /deploy/docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT [ "/docker-entrypoint.sh" ]
