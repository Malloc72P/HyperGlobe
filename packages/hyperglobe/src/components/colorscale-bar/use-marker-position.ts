import { isSafeNumber, resolveNumber } from '@hyperglobe/tools';
import { useMemo } from 'react';
import { findStepByValue } from 'src/hooks/use-colorscale';
import { useMainStore } from 'src/store/main-store';
import type { ColorScaleModel } from 'src/types/colorscale';

export interface UseMarkerPositionParams {
  colorScale: ColorScaleModel;
}

export function useMarkerPosition({ colorScale }: UseMarkerPositionParams) {
  const { minValue, maxValue } = colorScale;
  const hoveredRegion = useMainStore((s) => s.hoveredRegion);

  const markerPosition = useMemo(() => {
    let position = 0;
    const value = hoveredRegion?.data?.value;
    const step = findStepByValue(colorScale, value);

    if (!isSafeNumber(value) || !step) return -1;

    // 각 스텝의 from, to 값 계산. from/to가 무한대일 수 있으므로. 이 경우 minValue/maxValue로 대체
    const from = resolveNumber(step.from, minValue);
    const to = resolveNumber(step.to, maxValue);
    // 스텝 너비 비율, 시작 위치 비율 계산
    const stepWidth = 1 / colorScale.steps.length;
    const startPosition = step.index / colorScale.steps.length;
    // 스텝 내부에서의 상대적 위치 계산. 값이 해당 구간에서 몇 퍼센트 위치에 있는지를 계산한다.
    const stepRange = to - from; // 스텝 구간 길이
    const relativePosition = (value - from) / stepRange; // 구간 내부에서의 상대적 위치 (0~1 사이)
    // 시작 위치에서 해당 구간에서의 상대적 위치를 더하여 최종 위치 계산
    position = startPosition + relativePosition * stepWidth;

    return Math.max(0, Math.min(100, position * 100));
  }, [hoveredRegion, colorScale]);

  return [markerPosition];
}
