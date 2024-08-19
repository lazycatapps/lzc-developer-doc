import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "懒猫微服SDK",
  description: "突破传统，技术赋能",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "介绍", link: "/introduction" },
    ],

    sidebar: [
      {
        text: "简介",
        items: [
          { text: "什么是 Lzc-SDK?", link: "/introduction" },
          { text: "快速开始", link: "/quick-start" },
          { text: "应用开发", link: "/appdev" },
          { text: "在微服上开发", link: "/devshell" },
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
