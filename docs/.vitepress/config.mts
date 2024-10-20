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
        text: "介绍",
        items: [
          { text: "欢迎", link: "/index.md" },
          { text: "开发环境", link: "/lzc-cli.md" },
        ],
      },
      {
        text: "Docker开发模式",
        items: [
          { text: "Hello World", link: "/HelloWorld.md" },
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
