import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  staticDirs: ['../public'],
  stories: [
    '../pages/**/*.mdx',
    '../pages/**/*.stories.tsx',
    '../src/**/*.mdx',
    '../src/**/*.stories.tsx',
  ],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
  ],
  docs: {
    docsMode: true,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      // 1. 유니온 타입(|)의 값을 그대로 보여줌
      shouldExtractLiteralValuesFromEnum: true,
      // 2. 'undefined'가 포함된 경우 제거하여 깔끔하게 보여줌
      shouldRemoveUndefinedFromOptional: true,
      // 3. (중요) node_modules에 있는 타입도 필요하면 파싱 (외부 라이브러리 타입 쓸 때 필수)
      propFilter: (prop) => {
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        return true;
      },
    },
  },
};

export default config;
