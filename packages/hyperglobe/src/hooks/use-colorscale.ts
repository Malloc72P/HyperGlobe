import { useMemo } from 'react';
import type { ColorScaleStepModel } from 'src/types/colorscale';
import type { FeatureStyle } from 'src/types/feature';
import { label } from 'three/tsl';

export interface ColorScaleStepOptions {
  /**
   * 컬러스케일 구간의 라벨
   */
  label?: string;
  /**
   * 컬러스케일 구간의 최솟값
   *
   * - 구간은 from을 포함합니다.(from 이상)
   * - 생략하는 경우 음의 무한대를 의미합니다.
   */
  from?: number;
  /**
   * 컬러스케일 구간의 상한.
   *
   * - 구간은 to를 포함하지 않습니다.(to 미만)
   * - 생략하는 경우 양의 무한대를 의미합니다.
   */
  to?: number;
  /**
   * 구간에 적용될 스타일
   */
  style?: FeatureStyle;
  /**
   * 구간에 적용될 호버 스타일
   */
  hoverStyle?: FeatureStyle;
}

export interface ColorScaleOptions {
  steps: ColorScaleStepOptions[];
}

export function useColorScale({ steps: stepOptions }: ColorScaleOptions) {
  const steps = useMemo<ColorScaleStepModel[]>(() => {
    return stepOptions.map((stepOption, index) => ({
      id: `cs-step-${index}`,
      label: stepOption.label || '',
      from: stepOption.from || -Infinity,
      to: stepOption.to || Infinity,
      style: stepOption.style,
      hoverStyle: stepOption.hoverStyle,
    }));
  }, [stepOptions]);

  return steps;
}
