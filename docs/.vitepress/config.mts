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
        text: "入门",
        items: [
          { text: "欢迎", link: "/index.md" },
        ],
      },
      {
        text: "环境搭建",
        items: [
          { text: "开发环境", link: "/lzc-cli.md" },
          { text: "开发模式", link: "/develop-mode.md" },
          { text: "Hello World", link: "/hello-world.md" },
          { text: "反向代理模式配置", link: "/proxy.md" },
        ],
      },
      {
        text: "开发应用",
        items: [
          { text: "第一个Python应用", link: "/todolist-python.md" },
          { text: "Python应用详解", link: "/todolist-python-description.md" },
          { text: "第一个Golang应用", link: "/todolist-go.md" },
        ],
      },
      {
        text: "高级篇",
        items: [
          { text: "文件访问", link: "/advanced-file.md" },
          { text: "数据库服务", link: "/advanced-db.md" },
          { text: "服务启动依赖", link: "/advanced-depends.md" },
          { text: "GPU加速", link: "/advanced-gpu.md" },
        ],
      },
      {
        text: "发布应用",
        items: [
          { text: "发布自己的第一个应用", link: "/release-app.md" },
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
