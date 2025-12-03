import { useMemo } from 'react';
import type { ColorScaleModel, ColorScaleStepModel } from 'src/types/colorscale';
import type { ColorScaleLabelFormatter } from './colorscale-bar';
import classes from './colorscale-bar.module.css';

export interface ColorScaleStepProps {
  colorscale: ColorScaleModel;
  step: ColorScaleStepModel;
  formatLabel: ColorScaleLabelFormatter;
}

export function ColorScaleStep({ colorscale, step, formatLabel }: ColorScaleStepProps) {
  return (
    <div className={classes.step}>
      {/* 컬러스케일 막대 한칸 */}
      <div
        style={{
          background: step.color,
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

export interface ColorScaleStepLabelProps {
  colorscale: ColorScaleModel;
  step: ColorScaleStepModel;
  target: 'from' | 'to';
  formatLabel: ColorScaleLabelFormatter;
}

export function ColorScaleStepLabel({
  colorscale,
  step,
  target,
  formatLabel,
}: ColorScaleStepLabelProps) {
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
