import { useMemo } from 'react';
import type { FeatureStyle } from '../types/feature';
import type { RegionModel } from '@hyperglobe/interfaces';
import { useMainStore } from 'src/store';

export interface UseFeatureStyleProps {
  regionModel?: RegionModel | null;
  style?: FeatureStyle;
  hoverStyle?: FeatureStyle;
}

export function useFeatureStyle({ regionModel, style, hoverStyle }: UseFeatureStyleProps) {
  // 리젼이 호버된 상태인지 여부
  // 호버링 상태가 바뀐 컴포넌트만 리랜더링해야 하므로, 호버된 모델을 꺼내지 않고, ID 비교만 수행함.
  // 호버된 모델을 꺼내면, 해당 모델이 바뀔 때마다 모든 컴포넌트가 리랜더링됨.
  const isHoveredRegion = useMainStore(
    (s) => regionModel && s.hoveredRegion?.id === regionModel.id
  );

  const appliedStyle = useMemo<FeatureStyle>(() => {
    const _style = { ...style };

    if (isHoveredRegion) {
      Object.assign(_style, hoverStyle);
    }

    return _style;
  }, [style, hoverStyle, isHoveredRegion]);

  return [appliedStyle];
}
