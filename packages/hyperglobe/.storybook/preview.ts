import type { Preview } from '@storybook/react-vite';

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
          'API',
          'Hooks',
          'Release_Notes',
          ['v1.0.1', 'v1.0.0'],
        ],
      },
    },
  },
};

export default preview;
