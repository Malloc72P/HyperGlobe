import { useMemo, useRef } from 'react';
import type { ColorScaleModel, ColorScaleStepModel } from 'src/types/colorscale';
import classes from './colorscale-bar.module.css';
import { useMainStore } from 'src/store';
import { isSafeNumber, resolveNumber } from '@hyperglobe/tools';
import { findStepByValue } from 'src/hooks/use-colorscale';

export type ColorScaleLabelFormatter = (value: number) => string;

/**
 * 컬러스케일 바 컴포넌트
 *
 * - 컬러스케일 모델을 시각적으로 표시하는 막대 컴포넌트입니다.
 */
export interface ColorScaleBarProps {
  /**
   * 컬러스케일 모델
   *
   * useColorScale 훅을 사용하여 생성한 모델을 전달합니다.
   */
  colorScale: ColorScaleModel;
  /**
   * 컬러스케일 루트 스타일
   */
  style?: React.CSSProperties;
  /**
   * 컬러스케일 레이블 포맷터 함수
   */
  formatLabel?: ColorScaleLabelFormatter;
}

export function ColorScaleBar({
  style,
  colorScale,
  formatLabel = (value) => value.toFixed(0),
}: ColorScaleBarProps) {
  const { minValue, maxValue } = colorScale;
  const rootRef = useRef<HTMLDivElement>(null);
  const hoveredRegion = useMainStore((s) => s.hoveredRegion);
  const markerPosition = useMemo(() => {
    let position = 0;
    const value = hoveredRegion?.data?.value;
    const step = findStepByValue(colorScale, value);

    if (!isSafeNumber(value) || !step) return 0;

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

  return (
    <div ref={rootRef} className={classes.root} style={style}>
      {/* 마커 & 마커 컨테이너 */}
      <div className={classes.markerContainer}>
        <div className={classes.marker} style={{ left: `${markerPosition}%` }}></div>
      </div>

      {/* 스텝 & 레이블 */}
      {colorScale.steps.map((step) => (
        <ColorScaleStep
          key={step.id}
          colorscale={colorScale}
          step={step}
          formatLabel={formatLabel}
        />
      ))}
    </div>
  );
}

interface ColorScaleStepProps {
  colorscale: ColorScaleModel;
  step: ColorScaleStepModel;
  formatLabel: ColorScaleLabelFormatter;
}

function ColorScaleStep({ colorscale, step, formatLabel }: ColorScaleStepProps) {
  return (
    <div className={classes.step}>
      {/* 컬러스케일 막대 한칸 */}
      <div
        style={{
          background: step.style?.fillColor,
        }}
        className={classes.stepBar}
      />
      {/* 컬러스케일 레이블 */}
      <div className={classes.labelContainer}>
        <ColorScaleStepLabel
          colorscale={colorscale}
          step={step}
          target="from"
          formatLabel={formatLabel}
        />
        <ColorScaleStepLabel
          colorscale={colorscale}
          step={step}
          target="to"
          formatLabel={formatLabel}
        />
      </div>
    </div>
  );
}

interface ColorScaleStepLabelProps {
  colorscale: ColorScaleModel;
  step: ColorScaleStepModel;
  target: 'from' | 'to';
  formatLabel: ColorScaleLabelFormatter;
}

function ColorScaleStepLabel({ colorscale, step, target, formatLabel }: ColorScaleStepLabelProps) {
  const label = useMemo(() => {
    const value = target === 'to' ? step.to : step.from;
    const isSentinel = step.index === 0 || step.index === colorscale.steps.length - 1;
    let _label: number = value;

    if (!Number.isFinite(value) && isSentinel) {
      _label = target === 'from' ? colorscale.minValue : colorscale.maxValue;
    }

    return formatLabel(_label);
  }, [target, step, formatLabel, colorscale.minValue, colorscale.maxValue]);

  return (
    <p
      className={classes.pointLabel}
      data-label-type={target}
      data-step-index={step.index === step.stepTotal - 1 ? 'last' : step.index}
    >
      {label}
    </p>
  );
}
