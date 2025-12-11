import { Colors } from 'src/lib';
import { HyperGlobeProps } from 'src/types';

const defaultHyperglobeProps: HyperGlobeProps = {
  id: 'hyperglobe-canvas',
  hgmUrl: '/maps/nations-mid.hgm',
  size: '100%',
  maxSize: 900,
  style: { margin: '0 auto' },
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
    hoverStyle: {
      fillColor: Colors.BLUE[5],
    },
  },
};

export const StorybookConstant = {
  props: {
    HyperGlobe: defaultHyperglobeProps,
  },
};
