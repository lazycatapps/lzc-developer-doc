import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "懒猫微服应用开发",
  description: "突破传统，技术赋能",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "指南", link: "/" }],

    sidebar: [
      {
        text: "入门",
        items: [
          { text: "欢迎加入", link: "/index.md" },
          { text: "命令行工具", link: "/lzc-cli.md" },
        ],
      },
      {
        text: "Docker开发模式",
        items: [
          { text: "HelloWorld", link: "/HelloWorld.md" },
          { text: "反向代理模式配置", link: "/反向代理模式配置.md" },
          { text: "TodoList(Go语言版本)", link: "/TodoList-Go.md" },
          { text: "TodoList(Python语言版本)", link: "/TodoList-Python.md" },
        ],
      },
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
