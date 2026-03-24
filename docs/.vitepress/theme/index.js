import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import { h } from "vue";
import "./custom.css";

import CopyOrDownloadAsMarkdownButtons from "vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue";

export default {
  extends: DefaultTheme,
  Layout() {
    const { page } = useData();

    return h(DefaultTheme.Layout, null, {
      "doc-footer-before": () =>
        h("div", { class: "markdown-action-buttons" }, [
          h(CopyOrDownloadAsMarkdownButtons, {
            key: page.value.relativePath,
          }),
        ]),
    });
  },
};
