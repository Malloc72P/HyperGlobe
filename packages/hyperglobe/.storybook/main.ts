import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [
    '../pages/**/*.mdx',
    '../pages/**/*.stories.tsx',
    '../src/**/*.mdx',
    '../src/**/*.stories.tsx',
  ],
  addons: [
    {
      name: '@storybook/addon-docs',
    },
  ],
  docs: {
    docsMode: true,
  },
};

export default config;
