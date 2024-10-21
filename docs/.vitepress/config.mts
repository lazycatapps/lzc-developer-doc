import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "懒猫微服开发者手册",
  description: "高端私有云， 选懒猫就对了",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "指南", link: "/" }],

    sidebar: [
      {
        text: "欢迎",
        items: [
          { text: "欢迎使用懒猫微服", link: "/index.md" },
        ],
      },
      {
        text: "快速入门",
        items: [
          { text: "开发环境搭建", link: "/lzc-cli.md" },
          { text: "开发模式", link: "/develop-mode.md" },
          { text: "Hello World", link: "/hello-world.md" },
          { text: "反向代理模式配置", link: "/reverse-proxy.md" },
        ],
      },
      {
        text: "开发应用",
        items: [
          { text: "第一个Python应用", link: "/app-example-python.md" },
          { text: "Python应用配置详解", link: "/app-example-python-description.md" },
          { text: "Golang应用", link: "/app-example-go.md" },
        ],
      },
      {
        text: "高级技巧",
        items: [
          { text: "文件访问", link: "/advanced-file.md" },
          { text: "数据库服务", link: "/advanced-db.md" },
          { text: "服务启动依赖", link: "/advanced-depends.md" },
          { text: "应用关联", link: "/advanced-mime.md" },
          { text: "后台常驻", link: "/advanced-background.md" },
          { text: "GPU加速", link: "/advanced-gpu.md" },
          { text: "多实例", link: "/advanced-multi-instance.md" },
          { text: "公开API服务", link: "/advanced-public-api.md" },
          { text: "错误页面", link: "/advanced-error-template.md" },
          { text: "设置不支持的平台", link: "/advanced-platform.md" },
        ],
      },
      {
        text: "虚拟机",
        items: [
          { text: "KVM模式", link: "/kvm.md" },
        ],
      },
      {
        text: "扩展",
        items: [
          { text: "官方扩展", link: "/extensions.md" },
          { text: "自己假设网络穿透", link: "/network-pass-through.md" },
        ],
      },
      {
        text: "发布应用",
        items: [
          { text: "发布自己的第一个应用", link: "/publish-app.md" },
        ],
      }
    ],

    socialLinks: [
      { icon: "github", link: "https://gitee.com/linakesi/lzc-sdk" },
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
