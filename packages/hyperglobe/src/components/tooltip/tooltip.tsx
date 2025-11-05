import { useEffect, useRef } from 'react';
import { useMainStore } from '../../store';
import classes from './tooltip.module.css';
import { classnames } from '../../lib/css';

export interface TooltipProps {}

export function Tooltip({}: TooltipProps) {
  const ref = useRef<HTMLDivElement>(null);
  const registerTooltipRef = useMainStore((s) => s.registerTooltipRef);
  const hoveredRegion = useMainStore((s) => s.hoveredRegion);

  useEffect(() => {
    if (ref.current) {
      registerTooltipRef(ref);
    }
  }, [ref]);

  return (
    <div
      ref={ref}
      className={classnames('hygl-tooltip', classes.tooltip)}
      style={{
        display: hoveredRegion ? 'block' : 'none',
      }}
    >
      <div>{hoveredRegion?.id}</div>
      <div style={{ fontSize: 18 }}>{hoveredRegion?.name}</div>
    </div>
  );
}
