import { defineConfig } from "vitepress";

const zhLocaleThemeConfig = {
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
  sidebar: [
    {
      text: "欢迎",
      items: [
        { text: "欢迎使用懒猫微服", link: "/index.md" },
        { text: "懒猫微服的理念", link: "/start-from.md" },
        { text: "懒猫微服的架构设计", link: "/framework.md" },
        { text: "社区激励规则", link: "/store-rule.md" },
        { text: "开发者购机优惠", link: "/developer-cyber-discount.md" },
        { text: "应用上架审核指南", link: "/store-submission-guide.md" },
        {
          text: "入门必看文集(看了就会)",
          link: "/wangjishanren-lazycat-developer-startup.md",
        },
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
        { text: "DevShell开发模式", link: "/devshell-local.md" },
        { text: "开发依赖安装", link: "/devshell-install-and-use.md" },
        { text: "开发测试镜像", link: "/advanced-dev-image.md" },
        { text: "浏览器插件调试", link: "/advanced-browser-extension.md" },
        { text: "第一个 VNC应用", link: "/app-vnc.md" },
      ],
    },
    {
      text: "高级技巧",
      items: [
        { text: "启动依赖", link: "/advanced-depends.md" },
        { text: "文件访问", link: "/advanced-file.md" },
        { text: "数据库服务", link: "/advanced-db.md" },
        { text: "应用关联", link: "/advanced-mime.md" },
        { text: "后台常驻", link: "/advanced-background.md" },
        { text: "GPU 加速", link: "/advanced-gpu.md" },
        { text: "多实例", link: "/advanced-multi-instance.md" },
        { text: "平台支持", link: "/advanced-platform.md" },
        { text: "错误页面", link: "/advanced-error-template.md" },
        { text: "路由规则", link: "/advanced-route.md" },
        { text: "高级路由", link: "/advanced-routes.md" },
        { text: "应用域名规则", link: "/advanced-domain.md" },
        { text: "应用多域名", link: "/advanced-secondary-domains.md" },
        { text: "环境变量", link: "/advanced-envs.md" },
        { text: "初始化脚本", link: "/advanced-setupscript.md" },
        { text: "独立鉴权", link: "/advanced-public-api.md" },
        { text: "4层转发", link: "/advanced-l4forward.md" },
        { text: "HTTP Headers", link: "/http-request-headers.md" },
        { text: "对接 OIDC ", link: "/advanced-oidc.html" },
        { text: "manifest.yml渲染 ", link: "/advanced-manifest-render.html" },
      ],
    },
    {
      text: "扩展",
      items: [{ text: "官方扩展", link: "/extensions.md" }],
    },
    {
      text: "发布应用",
      items: [
        { text: "发布自己的第一个应用", link: "/publish-app.md" },
        { text: "移植第一个应用", link: "/app-example-porting.md" },
      ],
    },
    {
      text: "传统模式",
      items: [
        { text: "开通 SSH 访问", link: "/ssh.md" },
        { text: "KVM 模式", link: "/kvm.md" },
        { text: "Dockerd 模式", link: "/dockerd-support.md" },
      ],
    },
    {
      text: "常见问题",
      items: [
        { text: "开发应用 FAQ", link: "/faq-dev.md" },
        { text: "网络机制与 VPN", link: "/network.md" },
        { text: "应用白屏", link: "/app-block.md" },
        { text: "高级网络配置", link: "/network-config.md" },
        { text: "开机启动脚本", link: "/faq-startup_script.md" },
        { text: "自己架设网络穿透", link: "/network-pass-through.md" },
      ],
    },
    {
      text: "规范列表",
      items: [
        { text: "lzc-build.yml", link: "/spec/build.md" },
        { text: "lzc-manifest.yml", link: "/spec/manifest.md" },
      ],
    },
    {
      text: "系统变更日志(仅开发者相关)",
      items: [
        { text: "v1.4.1", link: "/changelogs/v1.4.1.md" },
        { text: "v1.3.9", link: "/changelogs/v1.3.9.md" },
        { text: "v1.3.8", link: "/changelogs/v1.3.8.md" },
        { text: "v1.3.7", link: "/changelogs/v1.3.7.md" },
        { text: "v1.3.6", link: "/changelogs/v1.3.6.md" },
        { text: "v1.3.4", link: "/changelogs/v1.3.4.md" },
        { text: "v1.3.0", link: "/changelogs/v1.3.0.md" },
        { text: "v1.2.0", link: "/changelogs/v1.2.0.md" },
      ],
    },
  ],
};

const enLocaleThemeConfig = {
  sidebar: [
    {
      text: "Welcome",
      items: [
        { text: "Welcome to LCMD", link: "/en/index.md" },
        { text: "LCMD Philosophy", link: "/en/start-from.md" },
        { text: "LCMD Architecture Design", link: "/en/framework.md" },
        { text: "Community Incentive Rules", link: "/en/store-rule.md" },
        {
          text: "Developer Hardware Discount",
          link: "/en/developer-cyber-discount.md",
        },
        {
          text: "App Store Submission Guide",
          link: "/en/store-submission-guide.md",
        },
        // {
        //   text: "Essential Reading Collection (Learn by Reading)",
        //   link: "/en/wangjishanren-lazycat-developer-startup.md",
        // },
      ],
    },
    {
      text: "Quick Start",
      items: [
        { text: "Development Mode", link: "/en/develop-mode.md" },
        { text: "Development Environment Setup", link: "/en/lzc-cli.md" },
        { text: "Hello World", link: "/en/hello-world.md" },
      ],
    },
    {
      text: "Developing Applications",
      items: [
        { text: "First Python Application", link: "/en/app-example-python.md" },
        {
          text: "Application Configuration Details",
          link: "/en/app-example-python-description.md",
        },
        { text: "First Golang Application", link: "/en/app-example-go.md" },
        { text: "DevShell Development Mode", link: "/en/devshell-local.md" },
        {
          text: "Development Dependency Installation",
          link: "/en/devshell-install-and-use.md",
        },
        { text: "Development Test Images", link: "/en/advanced-dev-image.md" },
        {
          text: "Browser Extension Debugging",
          link: "/en/advanced-browser-extension.md",
        },
        { text: "First VNC Application", link: "/en/app-vnc.md" },
      ],
    },
    {
      text: "Advanced Techniques",
      items: [
        { text: "Startup Dependencies", link: "/en/advanced-depends.md" },
        { text: "File Access", link: "/en/advanced-file.md" },
        { text: "Database Service", link: "/en/advanced-db.md" },
        { text: "Application Association", link: "/en/advanced-mime.md" },
        { text: "Background Persistence", link: "/en/advanced-background.md" },
        { text: "GPU Acceleration", link: "/en/advanced-gpu.md" },
        { text: "Multi-Instance", link: "/en/advanced-multi-instance.md" },
        { text: "Platform Support", link: "/en/advanced-platform.md" },
        { text: "Error Pages", link: "/en/advanced-error-template.md" },
        { text: "Routing Rules", link: "/en/advanced-route.md" },
        { text: "Advanced Routing", link: "/en/advanced-routes.md" },
        { text: "Application Domain Rules", link: "/en/advanced-domain.md" },
        {
          text: "Application Multi-Domain",
          link: "/en/advanced-secondary-domains.md",
        },
        { text: "Environment Variables", link: "/en/advanced-envs.md" },
        { text: "Initialization Script", link: "/en/advanced-setupscript.md" },
        {
          text: "Independent Authentication",
          link: "/en/advanced-public-api.md",
        },
        { text: "Layer 4 Forwarding", link: "/en/advanced-l4forward.md" },
        { text: "HTTP Headers", link: "/en/http-request-headers.md" },
        { text: "OIDC Integration", link: "/en/advanced-oidc.html" },
        {
          text: "manifest.yml Rendering",
          link: "/en/advanced-manifest-render.html",
        },
      ],
    },
    {
      text: "Extensions",
      items: [{ text: "Official Extensions", link: "/en/extensions.md" }],
    },
    {
      text: "Publishing Applications",
      items: [
        { text: "Publish Your First Application", link: "/en/publish-app.md" },
        { text: "Porting an Application", link: "/en/app-example-porting.md" },
      ],
    },
    {
      text: "Traditional Mode",
      items: [
        { text: "Enable SSH Access", link: "/en/ssh.md" },
        { text: "KVM Mode", link: "/en/kvm.md" },
        { text: "Dockerd Mode", link: "/en/dockerd-support.md" },
      ],
    },
    {
      text: "FAQ",
      items: [
        { text: "Development FAQ", link: "/en/faq-dev.md" },
        { text: "Network Mechanism and VPN", link: "/en/network.md" },
        { text: "Application Blank Display", link: "/en/app-block.md" },
        {
          text: "Advanced Network Configuration",
          link: "/en/network-config.md",
        },
        { text: "Boot Startup Script", link: "/en/faq-startup_script.md" },
        {
          text: "Self-Hosted Network Penetration",
          link: "/en/network-pass-through.md",
        },
      ],
    },
    {
      text: "Specifications",
      items: [
        { text: "lzc-build.yml", link: "/en/spec/build.md" },
        { text: "lzc-manifest.yml", link: "/en/spec/manifest.md" },
      ],
    },
    {
      text: "Changelog (Developer Only)",
      items: [
        { text: "v1.4.1", link: "/en/changelogs/v1.4.1.md" },
        { text: "v1.3.9", link: "/en/changelogs/v1.3.9.md" },
        { text: "v1.3.8", link: "/en/changelogs/v1.3.8.md" },
        { text: "v1.3.7", link: "/en/changelogs/v1.3.7.md" },
        { text: "v1.3.6", link: "/en/changelogs/v1.3.6.md" },
        { text: "v1.3.4", link: "/en/changelogs/v1.3.4.md" },
        { text: "v1.3.0", link: "/en/changelogs/v1.3.0.md" },
        { text: "v1.2.0", link: "/en/changelogs/v1.2.0.md" },
      ],
    },
  ],
  markdown: {
    lineNumbers: true,
    container: {
      tipLabel: "Tip",
      warningLabel: "Warning",
      dangerLabel: "Danger",
      infoLabel: "INFO",
      detailsLabel: "Details",
    },
  },
};

// https://vitepress.dev/reference/site-config
export default defineConfig({
  locales: {
    root: {
      label: "简体中文",
      lang: "zh",
      dir: "zh",
      title: "懒猫微服开发者手册",
      description: "高端私有云， 选懒猫就对了",
      themeConfig: zhLocaleThemeConfig,
    },
    en: {
      label: "English",
      lang: "en",
      themeConfig: enLocaleThemeConfig,
    },
  },
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
    outline: {
      level: [2, 3],
    },

    docFooter: {
      prev: "上一章",
      next: "下一章",
    },

    sidebarMenuLabel: "目录",

    returnToTopLabel: "返回到顶部",

    socialLinks: [
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.59.59 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296Z"/></svg>',
        },
        ariaLabel: "gitee",
        link: "https://gitee.com/lazycatcloud",
      },
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
    nav: [
      { text: "指南", link: "/" },
      { text: "开发者中心", link: "https://developer.lazycat.cloud/manage" },
    ],
  },
});
