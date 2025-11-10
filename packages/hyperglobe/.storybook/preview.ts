import type { Preview } from '@storybook/react-vite';
import { Canvas, Controls } from '@storybook/blocks';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Guide', 'Demo', 'Components', ['HyperGlobe']],
      },
    },
  },
};

export default preview;
