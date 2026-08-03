import type { StorybookConfig } from "@storybook/vue3-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [],
  framework: {
    name: "@storybook/vue3-vite",
    options: {
      docgen: {
        plugin: "vue-component-meta",
        tsconfig: "tsconfig.app.json",
      },
    },
  },
};
export default config;
