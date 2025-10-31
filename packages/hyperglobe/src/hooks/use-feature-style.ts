import { useMemo } from 'react';
import type { FeatureStyle } from '../types/feature';

export interface UseFeatureStyleProps {
  hovered: boolean;
  style?: FeatureStyle;
  hoverStyle?: FeatureStyle;
}

export function useFeatureStyle({ hovered, style, hoverStyle }: UseFeatureStyleProps) {
  const appliedStyle = useMemo<FeatureStyle>(() => {
    const _style = { ...style };

    if (hovered) {
      Object.assign(_style, hoverStyle);
    }

    return _style;
  }, [style, hoverStyle, hovered]);

  return [appliedStyle];
}
