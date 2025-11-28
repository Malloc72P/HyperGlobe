import type { Preview } from '@storybook/react-vite';
import { Canvas, Controls } from '@storybook/blocks';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'Guide',
          'Demo',
          ['Nations', 'RoundTheWorld', 'ColorScaleBar'],
          'Components',
          [
            'HyperGlobe',
            'RegionFeature',
            'MarkerFeature',
            'RouteFeature',
            'Graticule',
            'ColorScaleBar',
            'Tooltip',
          ],
        ],
      },
    },
  },
};

export default preview;
