import { useMemo } from 'react';
import { UiConstant } from 'src/constants';
import { SvgStyle } from 'src/types/svg';

export interface UseSvgStyleProps {
  style?: SvgStyle;
}

/**
 * SVG의 스타일을 계산하는 훅
 *
 * - 현재 기본 스타일만 적용한다
 */
export function useSvgStyle({ style }: UseSvgStyleProps) {
  const appliedStyle = useMemo<SvgStyle>(() => {
    // 기본 스타일 및 style 병합
    const _style: SvgStyle = {
      ...UiConstant.svgFeature.default.style,
      ...style,
    };

    return _style;
  }, [style]);

  return [appliedStyle];
}
