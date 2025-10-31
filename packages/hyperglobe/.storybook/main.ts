import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

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
      //   options: {
      //     mdxPluginOptions: {
      //       mdxCompileOptions: {
      //         remarkPlugins: [remarkGfm], // GitHub Flavored Markdown 지원
      //       },
      //     },
      //   },
    },
  ],
  docs: {
    docsMode: true,
  },
};

export default config;
