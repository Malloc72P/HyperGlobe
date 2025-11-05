import { useEffect, useRef } from 'react';
import { useMainStore } from '../../store';
import classes from './tooltip.module.css';
import { classnames } from '../../lib/css';

export interface TooltipProps {
  style?: React.CSSProperties;
  styles?: {
    rootStyle?: React.CSSProperties;
    idStyle?: React.CSSProperties;
    nameStyle?: React.CSSProperties;
  };
}

/**
 * 툴팁 컴포넌트
 *
 * - 호버된 지역(RegionFeature)의 정보를 표시합니다.
 * - 툴팁은 HTML로 구현되었으며, props를 통해 tooltip 내용을 커스터마이징할 수 있습니다.
 * - 툴팁은 호버된 객체의 데이터를 참조할 수 있습니다.
 */
export function Tooltip({ style, styles }: TooltipProps) {
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
      className={classnames('hyperglobe-tooltip', classes.tooltip)}
      hidden={!hoveredRegion}
      style={{
        ...style,
        ...styles?.rootStyle,
      }}
    >
      <div style={{ ...styles?.idStyle }}>{hoveredRegion?.id}</div>
      <div style={{ fontSize: 18, ...styles?.nameStyle }}>{hoveredRegion?.name}</div>
    </div>
  );
}
