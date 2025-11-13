import type { ColorScaleModel, ColorScaleStepModel } from 'src/types/colorscale';
import classes from './colorscale-bar.module.css';
import { getColorScaleStyle } from 'src/hooks/use-colorscale';
import { useMainStore } from 'src/store';

export interface ColorscaleBarProps {
  style?: React.CSSProperties;
  colorScale: ColorScaleModel;
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
    <div
      style={{
        background: step.style?.fillColor,
      }}
      className={classes.step}
    >
      {step.index === 0 && (
        <p
          className={classes.pointLabel}
          data-label-type="from"
          data-infinity={step.from === -Infinity}
        >
          {step.from === -Infinity ? '-∞' : step.from}
        </p>
      )}
      <p className={classes.pointLabel} data-label-type="to" data-infinity={step.to === Infinity}>
        {step.to === Infinity ? '∞' : step.to}
      </p>
    </div>
  );
}
