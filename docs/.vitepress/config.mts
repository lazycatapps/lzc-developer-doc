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
          { text: "安装工具", link: "/installtion" },
        ],
      },
      {
        text: "文档全览",
        items: [
          { text: "SDK文档", link: "/sdk-helper" },
          { text: "高级配置", link: "/advanced-config" },
          { text: "开发风格约定", link: "/code-style" },
          { text: "上架懒猫商店", link: "/submit-appstore" },
        ],
      },
      {
        text: "开发示例",
        items: [
          { text: "Demo1", link: "/demo/demo1" },
          { text: "Demo2", link: "/demo/demo2" },
          { text: "Demo3", link: "/demo/demo3" },
          { text: "Demo4", link: "/demo/demo4" },
          { text: "Demo5", link: "/demo/demo5" },
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
