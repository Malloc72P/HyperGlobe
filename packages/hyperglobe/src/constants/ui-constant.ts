import { MathConstants } from '@hyperglobe/tools';
import { Colors } from 'src/lib';
import type { FeatureStyle } from 'src/types/feature';
import { SvgStyle } from 'src/types/svg';

export const DefaultFeatureStyle: FeatureStyle = {
  lineWidth: 1.5,
  fillOpacity: 1,
  color: Colors.BLUE[7],
  fillColor: Colors.BLUE[3],
};
export const DefaultFeatureHoverStyle: FeatureStyle = {
  lineWidth: 2,
};
export const DefaultSvgStyle: SvgStyle = {
  stroke: Colors.GRAY[9],
  strokeWidth: 1,
};

export const UiConstant = {
  feature: {
    strokeRadius: MathConstants.FEATURE_STROKE_Z_INDEX,
    fillRadius: MathConstants.FEATURE_FILL_Z_INDEX,
    extrusionDepth: 0.007,
  },
  polygonFeature: {
    default: {
      style: DefaultFeatureStyle,
      hoverStyle: DefaultFeatureHoverStyle,
    },
  },
  svgFeature: {
    default: {
      style: DefaultSvgStyle,
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
