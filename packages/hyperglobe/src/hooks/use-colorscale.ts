import type { HGMFeature, RegionModel } from '@hyperglobe/interfaces';
import { isSafeNumber, resolveNumber } from '@hyperglobe/tools';
import { useCallback, useMemo } from 'react';
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

  /**
   * 원본 데이터 배열
   */
  data?: any[];
  /**
   * 데이터에서 피쳐에 해당하는 항목을 찾는 함수
   *
   * - feature: HGMFeature
   * - dataItem: 원본 데이터 배열의 항목
   *
   * @default (feature, item) => feature.id === item.id
   */
  itemResolver?: (feature: HGMFeature, dataItem: any) => boolean;
  /**
   * 원본 데이터에서 값을 추출하는 함수
   *
   * @default (dataItem) => dataItem.value
   */
  valueResolver?: (dataItem: any) => number | null | undefined;
}

/**
 * 컬러스케일 모델을 생성합니다.
 */
export function useColorScale({
  nullStyle,
  steps: stepOptions,
  data,
  itemResolver = (feature, item) => feature.id === item.id,
  valueResolver = (dataItem) => dataItem.value,
}: ColorScaleOptions) {
  /**
   * 컬러스케일 모델
   */
  const colorscale = useMemo<ColorScaleModel>(() => {
    const stepModels = stepOptions.map((stepOption, index) => ({
      id: `cs-step-${index}`,
      stepTotal: stepOptions.length,
      index,
      label: stepOption.label || '',
      from: resolveNumber(stepOption.from, -Infinity),
      to: resolveNumber(stepOption.to, Infinity),
      style: stepOption.style,
      hoverStyle: stepOption.hoverStyle,
    }));

    let minValue = Infinity;
    let maxValue = -Infinity;

    if (data && data.length > 0) {
      for (const item of data) {
        const value = valueResolver(item);

        if (isSafeNumber(value)) {
          minValue = Math.min(minValue, value);
          maxValue = Math.max(maxValue, value);
        }
      }
    }

    const colorScaleModel = {
      nullStyle,
      steps: stepModels,
      minValue: isSafeNumber(minValue) ? minValue : -Infinity,
      maxValue: isSafeNumber(maxValue) ? maxValue : Infinity,
    };

    console.log(colorScaleModel);

    return colorScaleModel;
  }, [nullStyle, stepOptions, data]);

  /**
   * 피쳐에 해당하는 데이터를 찾아 반환하는 함수
   *
   * - 반환되는 데이터는 { value: number | null } 형태입니다.
   * - 값이 null인 피쳐에 대한 스타일을 지정하려면 colorscale.nullStyle를 사용하세요.
   */
  const resolveFeatureData = useCallback(
    (feature: HGMFeature) => {
      const foundItem = data?.find((dataItem) => itemResolver(feature, dataItem));
      const value = foundItem ? valueResolver(foundItem) : null;

      return {
        value,
      };
    },
    [data, itemResolver, valueResolver]
  );

  return { colorscale, resolveFeatureData };
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
