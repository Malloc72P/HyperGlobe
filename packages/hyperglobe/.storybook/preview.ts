// Replace your-framework with the framework you are using, e.g. react-vite, nextjs, vue3-vite, etc.
import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: ['Guide', 'Components', ['HyperGlobe(지구본)', 'RegionFeature(지역)']],
      },
    },
  },
};

export default preview;
