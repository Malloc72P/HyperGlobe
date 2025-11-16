import { MathConstants } from '@hyperglobe/tools';
import { Colors } from 'src/lib';
import type { FeatureStyle } from 'src/types/feature';

export const DefaultFeatureStyle: FeatureStyle = {
  lineWidth: 1.2,
  fillOpacity: 1,
  color: Colors.BLUE[7],
  fillColor: Colors.BLUE[5],
};
export const DefaultFeatureHoverStyle: FeatureStyle = {
  lineWidth: 2,
};

export const UiConstant = {
  feature: {
    strokeRadius: MathConstants.FEATURE_STROKE_Z_INDEX,
    fillRadius: MathConstants.FEATURE_FILL_Z_INDEX,
  },
  polygonFeature: {
    default: {
      style: DefaultFeatureStyle,
      hoverStyle: DefaultFeatureHoverStyle,
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
