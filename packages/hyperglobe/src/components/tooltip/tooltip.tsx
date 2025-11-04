import { useEffect, useRef } from 'react';
import { useMainStore } from '../../store';

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
      className="tooltip"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transition: '0.1s',
        pointerEvents: 'none',
        background: 'white',
        border: '1px solid black',
        padding: '4px',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        minWidth: '80px',
        display: hoveredRegion ? 'block' : 'none',
      }}
    >
      <div>{hoveredRegion?.id}</div>
      <div style={{ fontSize: 18 }}>{hoveredRegion?.name}</div>
    </div>
  );
}
