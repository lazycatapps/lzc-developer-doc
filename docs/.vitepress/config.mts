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
        text: "快速上手",
        items: [
          { text: "基本介绍", link: "/introduction" },
          { text: "如何安装", link: "/installtion" },
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
      infoLabel: "展示信息",
      detailsLabel: "详细说明",
    },
  },
});
