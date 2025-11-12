export const UiConstant = {
  feature: {
    strokeRadius: 1.005,
    fillRadius: 1.004,
  },
  polygonFeature: {
    default: {
      style: {
        lineWidth: 1.2,
        color: '#3a5dbb',
        fillColor: '#78a9e2',
      },
      hoverStyle: {
        lineWidth: 2,
      },
    },
  },
  globe: {
    /**
     * 0,0,0을 하면 [1, 0, 0]이 경위도 0,0이 된다.
     *
     * y축으로 90도 회전시키면, [0, 0, 1]이 경위도 0,0이 된다.
     */
    rotation: [0, -Math.PI / 2, 0] as [number, number, number],
  },
};
