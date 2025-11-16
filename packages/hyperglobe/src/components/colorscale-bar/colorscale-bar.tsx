import { useMemo } from 'react';
import type { ColorScaleModel, ColorScaleStepModel } from 'src/types/colorscale';
import classes from './colorscale-bar.module.css';
import { useMainStore } from 'src/store';
import { isSafeNumber } from '@hyperglobe/tools';

export type ColorScaleLabelFormatter = (value: number) => string;

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
  const hoveredRegion = useMainStore((s) => s.hoveredRegion);
  const markerPosition = useMemo(() => {
    const { minValue, maxValue } = colorScale;
    let position = 0;
    const value = hoveredRegion?.data?.value;

    if (!isSafeNumber(value)) return 0;

    const clampedValue = Math.min(Math.max(value, minValue), maxValue);
    position = ((clampedValue - minValue) / (maxValue - minValue)) * 100;

    return position;
  }, [hoveredRegion, colorScale]);
  return (
    <div className={classes.root} style={style}>
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
