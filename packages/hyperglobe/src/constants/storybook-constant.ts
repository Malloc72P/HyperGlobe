import { Colors } from 'src/lib';
import { HyperGlobeProps } from 'src/types';

const defaultHyperglobeProps: HyperGlobeProps = {
  id: 'hyperglobe-canvas',
  hgmUrl: 'https://unpkg.com/@malloc72p/hyperglobe-maps/dist/nations-mid.hgm',
  size: '100%',
  maxSize: 900,
  style: { margin: '0 auto', maxWidth: 400 },
  graticule: true,
  globe: {
    style: {
      color: Colors.GRAY[1],
      metalness: 0,
      roughness: 0,
    },
  },
  region: {
    style: {
      fillColor: Colors.BLUE[3],
    },
  },
};

export const StorybookConstant = {
  props: {
    HyperGlobe: defaultHyperglobeProps,
  },
};
