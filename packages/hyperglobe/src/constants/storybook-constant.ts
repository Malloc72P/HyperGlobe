import { Colors } from 'src/lib';

export const StorybookConstant = {
  props: {
    HyperGlobe: {
      id: 'hyperglobe-canvas',
      hgmUrl: '/maps/nations-mid.hgm',
      size: '100%',
      maxSize: 900,
      style: { margin: '0 auto' },
      globe: {
        style: {
          color: Colors.GRAY[1],
          metalness: 0,
          roughness: 0,
        },
      },
    },
  },
  /** @deprecated 기존 API용. 새 API에서는 props.HyperGlobe 사용 */
  legacyProps: {
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
