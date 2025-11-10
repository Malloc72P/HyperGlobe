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
  const hoveredRegion = useMainStore((s) => s.hoveredRegion);

  const appliedStyle = useMemo<FeatureStyle>(() => {
    const _style = { ...style };

    if (regionModel && hoveredRegion && hoveredRegion.id === regionModel.id) {
      Object.assign(_style, hoverStyle);
    }

    return _style;
  }, [style, hoverStyle, hoveredRegion]);

  return [appliedStyle];
}
