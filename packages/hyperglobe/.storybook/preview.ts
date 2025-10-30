// Replace your-framework with the framework you are using, e.g. react-vite, nextjs, vue3-vite, etc.
import type { Preview } from '@storybook/react-vite';
import CanvasWrapper from './components/canvas-wrapper';

const preview: Preview = {
  parameters: {
    docs: {
      components: {
        Canvas: CanvasWrapper,
      },
    },
    options: {
      storySort: {
        order: ['Guide', 'Demo', 'Components', ['HyperGlobe', 'RegionFeature']],
      },
    },
  },
};

export default preview;
