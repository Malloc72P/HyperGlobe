import { Colors } from 'src/lib';

export const StorybookConstant = {
  props: {
    HyperGlobe: {
      id: 'hyperglobe-canvas',
      size: '100%',
      maxSize: 900,
      style: { margin: '0 auto' },
      globeStyle: {
        color: Colors.GRAY[1],
        metalness: 0,
        roughness: 0,
      },
    },
  },
};
