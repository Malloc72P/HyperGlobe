import type { RegionModel } from '@hyperglobe/interfaces';
import { useMemo } from 'react';
import { UiConstant } from 'src/constants';
import { useMainStore } from 'src/store';
import type { ColorScaleModel } from 'src/types/colorscale';
import type { FeatureStyle } from '../types/feature';
import { getColorScaleColor, getColorScaleHoverColor } from './use-colorscale';

export interface ComputeFeatureStyleParams {
  /** 기본 스타일 */
  style?: FeatureStyle;
  /** 호버 스타일 */
  hoverStyle?: FeatureStyle;
  /** 컬러스케일 모델 */
  colorscale?: ColorScaleModel;
  /** 컬러스케일 적용에 사용할 데이터 값 */
  dataValue?: number;
  /** 호버 상태 여부 */
  isHovered?: boolean;
}

/**
 * 단일 feature의 스타일을 계산하는 순수 함수
 *
 * - 우선순위: 기본 스타일 < colorscale 스타일 < 호버 스타일
 * - 훅이 아니므로 어디서든 호출 가능 (반복문 내부 등)
 */
export function computeFeatureStyle({
  style,
  hoverStyle,
  colorscale,
  dataValue,
  isHovered,
}: ComputeFeatureStyleParams): FeatureStyle {
  // 기본 스타일 및 style 병합
  let _style: FeatureStyle = {
    ...UiConstant.polygonFeature.default.style,
    ...style,
  };

  // 컬러스케일 색상 추가 적용
  if (colorscale && dataValue !== undefined) {
    const color = getColorScaleColor(colorscale, dataValue);
    if (color) {
      _style = { ..._style, fillColor: color };
    }
  }

  // 호버 스타일 추가 적용
  if (isHovered) {
    _style = { ..._style, ...UiConstant.polygonFeature.default.hoverStyle, ...hoverStyle };

    // 컬러스케일 호버 색상이 있으면 적용
    if (colorscale && dataValue !== undefined) {
      const hoverColor = getColorScaleHoverColor(colorscale, dataValue);
      if (hoverColor) {
        _style = { ..._style, fillColor: hoverColor };
      }
    }
  }

  return _style;
}

export interface UseFeatureStyleProps {
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
export function useFeatureStyle({
  regionModel,
  style,
  hoverStyle,
  colorscale,
}: UseFeatureStyleProps) {
  // 리젼이 호버된 상태인지 여부
  // 호버링 상태가 바뀐 컴포넌트만 리랜더링해야 하므로, 호버된 모델을 꺼내지 않고, ID 비교만 수행함.
  // 호버된 모델을 꺼내면, 해당 모델이 바뀔 때마다 모든 컴포넌트가 리랜더링됨.
  const isHoveredRegion = useMainStore(
    (s) => regionModel && s.hoveredRegion?.id === regionModel.id
  );

  const appliedStyle = useMemo<FeatureStyle>(() => {
    return computeFeatureStyle({
      style,
      hoverStyle,
      colorscale,
      dataValue: regionModel?.data?.value,
      isHovered: !!isHoveredRegion,
    });
  }, [style, hoverStyle, isHoveredRegion, colorscale, regionModel]);

  return [appliedStyle];
}
