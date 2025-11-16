import type { ColorScaleModel, ColorScaleStepModel } from 'src/types/colorscale';
import classes from './colorscale-bar.module.css';
import { getColorScaleStyle, isCurrentStep } from 'src/hooks/use-colorscale';
import { useMainStore } from 'src/store';
import { useMemo } from 'react';

export interface ColorscaleBarProps {
  colorScale: ColorScaleModel;
  style?: React.CSSProperties;
}

export function ColorScaleBar({ style, colorScale }: ColorscaleBarProps) {
  const hoveredRegion = useMainStore((s) => s.hoveredRegion);

  return (
    <div className={classes.root} style={style}>
      {colorScale.steps.map((step) => (
        <ColorScaleStep key={step.id} step={step} />
      ))}
    </div>
  );
}

interface ColorScaleStepProps {
  step: ColorScaleStepModel;
}

function ColorScaleStep({ step }: ColorScaleStepProps) {
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
        {step.index === 0 ? <ColorScaleStepLabel step={step} target="from" /> : <div />}
        <ColorScaleStepLabel step={step} target="to" />
      </div>
    </div>
  );
}

interface ColorScaleStepLabelProps {
  step: ColorScaleStepModel;
  target: 'from' | 'to';
}

function ColorScaleStepLabel({ step, target }: ColorScaleStepLabelProps) {
  const label = useMemo(() => {
    const value = target === 'to' ? step.to : step.from;

    if (!Number.isFinite(value)) {
      return '';
    }

    return value;
  }, [target, step]);

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
