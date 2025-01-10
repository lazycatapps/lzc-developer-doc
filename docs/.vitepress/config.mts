import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "懒猫微服开发者手册",
  description: "高端私有云， 选懒猫就对了",
  themeConfig: {
    search: {
      provider: "local",
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                },
              },
            },
          },
        },
      },
    },

    outlineTitle: "章节导航",

    docFooter: {
      prev: "上一章",
      next: "下一章",
    },

    sidebarMenuLabel: "目录",

    returnToTopLabel: "返回到顶部",

    socialLinks: [
      { icon: "github", link: "https://gitee.com/linakesi/lzc-sdk" },
      { icon: "twitter", link: "https://x.com/manateelazycat" },
    ],

    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "full",
        timeStyle: "medium",
      },
    },

    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "指南", link: "/" }],

    sidebar: [
      {
        text: "欢迎",
        items: [
          { text: "欢迎使用懒猫微服", link: "/index.md" },
          { text: "懒猫微服的理念", link: "/start-from.md" },
        ],
      },
      {
        text: "快速入门",
        items: [
          { text: "开发模式", link: "/develop-mode.md" },
          { text: "开发环境搭建", link: "/lzc-cli.md" },
          { text: "Hello World", link: "/hello-world.md" },
        ],
      },
      {
        text: "开发应用",
        items: [
          { text: "第一个 Python 应用", link: "/app-example-python.md" },
          { text: "应用配置详解", link: "/app-example-python-description.md" },
          { text: "第一个 Golang 应用", link: "/app-example-go.md" },
          { text: "开发依赖安装", link: "/devshell-install-and-use.md" },
          { text: "开发测试镜像", link: "/advanced-dev-image.md" },
          { text: "移植应用", link: "/app-example-porting.md" },
        ],
      },
      {
        text: "高级技巧",
        items: [
          { text: "路由规则", link: "/advanced-route.md" },
          { text: "启动依赖", link: "/advanced-depends.md" },
          { text: "文件访问", link: "/advanced-file.md" },
          { text: "数据库服务", link: "/advanced-db.md" },
          { text: "应用关联", link: "/advanced-mime.md" },
          { text: "环境变量", link: "/advanced-envs.md" },
          { text: "HTTP Headers", link: "/http-request-headers.md" },
          { text: "后台常驻", link: "/advanced-background.md" },
          { text: "GPU 加速", link: "/advanced-gpu.md" },
          { text: "多实例", link: "/advanced-multi-instance.md" },
          { text: "独立鉴权", link: "/advanced-public-api.md" },
          { text: "错误页面", link: "/advanced-error-template.md" },
          { text: "平台支持", link: "/advanced-platform.md" },
          { text: "系统版本依赖", link: "/advanced-runtime-dependence.md" },
          { text: "反向代理模式配置", link: "/reverse-proxy.md" },
          { text: "浏览器插件调试", link: "/advanced-browser-extension.md" },
        ],
      },
      {
        text: "扩展",
        items: [
          { text: "官方扩展", link: "/extensions.md" },
        ],
      },
      {
        text: "发布应用",
        items: [{ text: "发布自己的第一个应用", link: "/publish-app.md" }],
      },

      {
        text: "传统模式",
          items: [
          { text: "KVM 模式", link: "/kvm.md" },
          { text: "dockerd 模式", link: "/dockerd-support.md" },
        ],
      },
      {
        text: "常见问题",
        items: [
          { text: "开发应用 FAQ", link: "/faq-dev.md" },
          { text: "应用白屏", link: "/app-block.md" },
          { text: "网络机制与 VPN", link: "/network.md" },
          { text: "自己架设网络穿透", link: "/network-pass-through.md" },
          { text: "SSH 与内测", link: "/ssh.md" },
          { text: "高级网络配置", link: "/network-config.md" },
        ],
      },
      {
        text: "规范列表",
        items: [
          { text: "lzc-manifest.yml", link: "/spec/manifest.md" },
        ],
      },
      {
        text: "感谢",
        items: [
          { text: "开发者应用", link: "/third-apps.md" },
          { text: "贡献者", link: "/contributors.md" },
        ],
      },
      {
        text: "系统变更日志",
        items: [
          { text: "v1.2.0", link: "/changelogs/v1.2.0.md" },
        ],
      },
    ],
  },
  markdown: {
    lineNumbers: true,
    container: {
      tipLabel: "小技巧",
      warningLabel: "警告操作",
      dangerLabel: "危险操作",
      infoLabel: "INFO",
      detailsLabel: "详细说明",
    },
  },
});
