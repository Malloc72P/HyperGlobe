import { useMemo } from 'react';
import type { FeatureStyle } from '../types/feature';
import type { RegionModel } from '@hyperglobe/interfaces';
import { useMainStore } from 'src/store';
import type { ColorScaleModel } from 'src/types/colorscale';
import { color } from 'three/tsl';
import { getColorScaleStyle } from './use-colorscale';
import { fill } from 'three/src/extras/TextureUtils.js';
import { UiConstant } from 'src/constants';

export interface UseFeatureStyleProps<DATA_TYPE = any> {
  regionModel?: RegionModel | null;
  style?: FeatureStyle;
  hoverStyle?: FeatureStyle;
  colorscale?: ColorScaleModel;
}

/**
 * 리젼 피쳐의 스타일을 계산하는 훅
 *
 * - 우선순위: 기본 스타일 < colorscale 스타일 < 호버 스타일
 */
export function useFeatureStyle<DATA_TYPE = any>({
  regionModel,
  style,
  hoverStyle,
  colorscale,
}: UseFeatureStyleProps<DATA_TYPE>) {
  // 리젼이 호버된 상태인지 여부
  // 호버링 상태가 바뀐 컴포넌트만 리랜더링해야 하므로, 호버된 모델을 꺼내지 않고, ID 비교만 수행함.
  // 호버된 모델을 꺼내면, 해당 모델이 바뀔 때마다 모든 컴포넌트가 리랜더링됨.
  const isHoveredRegion = useMainStore(
    (s) => regionModel && s.hoveredRegion?.id === regionModel.id
  );

  const appliedStyle = useMemo<FeatureStyle>(() => {
    // 기본 스타일 및 style 병합
    let _style: FeatureStyle = {
      ...UiConstant.polygonFeature.default.style,
      ...style,
    };

    // 컬러스케일 스타일 추가 적용
    if (colorscale && regionModel && regionModel.data) {
      const colorscaleStyle = getColorScaleStyle(colorscale, regionModel.data.value) || {};

      _style = { ..._style, ...colorscaleStyle };
    }

    // 호버 스타일 추가 적용
    if (isHoveredRegion) {
      _style = { ..._style, ...UiConstant.polygonFeature.default.hoverStyle, ...hoverStyle };
    }

    return _style;
  }, [style, hoverStyle, isHoveredRegion, colorscale, regionModel]);

  return [appliedStyle];
}
