import { isSafeNumber, resolveNumber } from '@hyperglobe/tools';
import { useMemo } from 'react';
import type { ColorScaleModel, ColorScaleStepModel } from 'src/types/colorscale';
import { useCompare } from './use-compare';

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
   * 구간에 적용될 색상
   */
  color?: string;
  /**
   * 구간에 적용될 호버 색상
   */
  hoverColor?: string;
}

/**
 * 컬러스케일 옵션
 */
export interface ColorScaleWithDataOptions extends ColorScaleOptions {
  data: any[];
}

export interface ColorScaleOptions {
  /**
   * 값이 null인 경우 적용될 색상
   */
  nullColor?: string;
  /**
   * 컬러스케일 구간에 대한 옵션
   */
  steps: ColorScaleStepOptions[];
  /**
   * 값을 추출할 필드 이름
   */
  valueField?: string;
}

/**
 * 컬러스케일 모델을 생성합니다.
 */
export function useColorScale(_option?: ColorScaleWithDataOptions) {
  const option = useCompare(_option);

  /**
   * 컬러스케일 모델
   */
  const model = useMemo<ColorScaleModel | undefined>(() => {
    if (!option) return;

    const { nullColor, steps: stepOptions, data, valueField } = option;

    const stepModels = stepOptions.map((stepOption, index) => ({
      id: `cs-step-${index}`,
      stepTotal: stepOptions.length,
      index,
      label: stepOption.label || '',
      from: resolveNumber(stepOption.from, -Infinity),
      to: resolveNumber(stepOption.to, Infinity),
      color: stepOption.color,
      hoverColor: stepOption.hoverColor,
    }));

    let minValue = Infinity;
    let maxValue = -Infinity;

    if (data && data.length > 0) {
      for (const item of data) {
        const value = valueField ? item[valueField] : item?.value;

        if (isSafeNumber(value)) {
          minValue = Math.min(minValue, value);
          maxValue = Math.max(maxValue, value);
        }
      }
    }

    const colorScaleModel = {
      nullColor,
      steps: stepModels,
      minValue: isSafeNumber(minValue) ? minValue : -Infinity,
      maxValue: isSafeNumber(maxValue) ? maxValue : Infinity,
    };

    return colorScaleModel;
  }, [option]);

  return {
    /**
     * 컬러스케일 모델.
     *
     * - 모델을 RegionFeature에 전달하면, 값에 따라 스타일이 자동으로 적용됩니다.
     * - 적용되는 스타일은 컬러스케일 규칙을 따릅니다.
     * - 컬러스케일 규칙은 colorscale.steps에서 정의한 정보에 따라 결정됩니다.
     */
    colorscaleModel: model,
  };
}

/**
 * 값에 해당하는 컬러스케일 구간을 찾습니다.
 */
export const findStepByValue = (colorscale: ColorScaleModel, value: number) => {
  if (!isSafeNumber(value)) {
    return null;
  }

  return colorscale.steps.find((step) => step.from <= value && value < step.to);
};

export const isCurrentStep = (step: ColorScaleStepModel, value: any) => {
  return step.from <= value && value < step.to;
};

/**
 * 값에 해당하는 구간의 색상을 반환합니다.
 */
export const getColorScaleColor = (
  colorscale: ColorScaleModel,
  value: number
): string | undefined => {
  const step = findStepByValue(colorscale, value);

  return step?.color ?? colorscale.nullColor;
};

/**
 * 값에 해당하는 구간의 호버 색상을 반환합니다.
 */
export const getColorScaleHoverColor = (
  colorscale: ColorScaleModel,
  value: number
): string | undefined => {
  const step = findStepByValue(colorscale, value);

  return step?.hoverColor;
};
