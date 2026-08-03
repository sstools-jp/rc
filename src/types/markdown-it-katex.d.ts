declare module "markdown-it-katex" {
  import type MarkdownIt from "markdown-it";
  const plugin: (md: MarkdownIt) => void;
  export default plugin;
}
