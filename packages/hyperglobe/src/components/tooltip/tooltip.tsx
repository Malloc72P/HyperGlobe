import { useEffect, useRef } from 'react';
import { useMainStore } from '../../store';
import classes from './tooltip.module.css';
import { classnames } from '../../lib/css';

export interface TooltipProps {}

/**
 * 툴팁 컴포넌트
 *
 * - 호버된 지역(RegionFeature)의 정보를 표시합니다.
 * - 툴팁은 HTML로 구현되었으며, props를 통해 tooltip 내용을 커스터마이징할 수 있습니다.
 * - 툴팁은 호버된 객체의 데이터를 참조할 수 있습니다.
 */
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
