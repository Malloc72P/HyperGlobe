import type { RegionModel } from '@hyperglobe/interfaces';
import { useMemo } from 'react';
import type { ColorScaleModel, ColorScaleStepModel } from 'src/types/colorscale';
import type { FeatureStyle } from 'src/types/feature';

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

/**
 * 컬러스케일 옵션
 */
export interface ColorScaleOptions {
  /**
   * 값이 null인 경우 적용될 스타일
   */
  nullStyle?: FeatureStyle;
  /**
   * 컬러스케일 구간에 대한 옵션
   */
  steps: ColorScaleStepOptions[];
}

/**
 * 컬러스케일 모델을 생성합니다.
 */
export function useColorScale({ nullStyle, steps: stepOptions }: ColorScaleOptions) {
  /**
   * 컬러스케일 모델
   */
  const colorscale = useMemo<ColorScaleModel>(() => {
    return {
      nullStyle,
      steps: stepOptions.map((stepOption, index) => ({
        id: `cs-step-${index}`,
        stepTotal: stepOptions.length,
        index,
        label: stepOption.label || '',
        from: stepOption.from || -Infinity,
        to: stepOption.to || Infinity,
        style: stepOption.style,
        hoverStyle: stepOption.hoverStyle,
      })),
    };
  }, [nullStyle, stepOptions]);

  return { colorscale };
}

/**
 * 값에 해당하는 컬러스케일 구간을 찾습니다.
 */
export const findStepByValue = (colorscale: ColorScaleModel, value: number) => {
  return colorscale.steps.find((step) => step.from <= value && value < step.to);
};

export const isCurrentStep = (step: ColorScaleStepModel, value: any) => {
  return step.from <= value && value < step.to;
};

/**
 * 값에 해당하는 구간의 스타일을 반환합니다.
 */
export const getColorScaleStyle = (colorscale: ColorScaleModel, value: number) => {
  const step = findStepByValue(colorscale, value);

  return step ? step.style : colorscale.nullStyle;
};

/**
 * 값에 해당하는 구간의 호버 스타일을 반환합니다.
 */
export const getColorScaleHoverStyle = (colorscale: ColorScaleModel, value: number) => {
  const step = findStepByValue(colorscale, value);

  return step?.hoverStyle;
};
