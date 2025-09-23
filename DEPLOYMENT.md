# 部署指南

本文档网站基于 VitePress 构建，本指南将帮助您在本地部署和开发该文档网站。

## 环境要求

- Node.js 16+ 或更高版本
- npm 或 yarn 包管理器

## 本地开发

### 1. 克隆仓库

```bash
git clone <repository-url>
cd lzc-developer-doc
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run docs:dev
```

开发服务器会在 `http://localhost:5173` 启动，支持热重载功能。当您修改文档内容时，页面会自动刷新显示最新内容。

## 生产环境构建

### 1. 构建静态文件

```bash
npm run docs:build
```

构建完成后，静态文件会生成在 `docs/.vitepress/dist` 目录中。

### 2. 预览生产版本

```bash
npm run docs:preview
```

这将启动一个本地服务器来预览生产版本的网站。

### 3. 部署到 Web 服务器

将 `docs/.vitepress/dist` 目录中的所有文件复制到您的 Web 服务器根目录即可。

## Docker 部署

项目提供了完整的 Docker 部署方案：

### 1. 构建 Docker 镜像

```bash
# 首先构建静态文件
npm run docs:build

# 然后构建 Docker 镜像
docker build -f deploy/Dockerfile -t lzc-developer-doc .
```

### 2. 运行容器

```bash
docker run -p 8080:80 lzc-developer-doc
```

容器将在 `http://localhost:8080` 提供服务。

## 项目结构

```
.
├── docs/                  # 文档源文件
│   ├── .vitepress/       # VitePress 配置
│   │   ├── config.mts    # 网站配置文件
│   │   └── dist/         # 构建输出目录
│   ├── index.md          # 首页
│   └── *.md              # 各个文档页面
├── deploy/               # 部署相关文件
│   ├── Dockerfile        # Docker 镜像构建文件
│   ├── nginx.conf        # Nginx 配置文件
│   └── docker-entrypoint.sh
└── package.json          # 项目依赖配置
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run docs:dev` | 启动开发服务器 |
| `npm run docs:build` | 构建生产版本 |
| `npm run docs:preview` | 预览生产版本 |

## 故障排除

### 端口冲突

如果默认端口 5173 被占用，VitePress 会自动选择下一个可用端口。您也可以通过以下方式指定端口：

```bash
npm run docs:dev -- --port 3000
```

### 构建失败

如果构建过程中出现错误，请检查：

1. Node.js 版本是否符合要求
2. 是否正确安装了所有依赖
3. 文档文件中是否有语法错误

### Docker 构建问题

确保在构建 Docker 镜像之前已经运行了 `npm run docs:build` 命令，因为 Dockerfile 需要使用构建后的静态文件。

## 开发贡献

如果您想为文档做出贡献：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 在本地进行修改和测试
4. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 创建 Pull Request

## 技术支持

如果在部署过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 在 Gitee Issues 中搜索相关问题
3. 创建新的 Issue 描述您遇到的问题

感谢您对懒猫微服开发者文档的贡献！
