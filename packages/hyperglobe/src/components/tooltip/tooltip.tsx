import { useEffect, useMemo, useRef } from 'react';
import { useMainStore } from '../../store';
import classes from './tooltip.module.css';
import { classnames } from '../../lib/css';
import type { RegionModel } from '@hyperglobe/interfaces';

export interface TooltipOptions {
  style?: React.CSSProperties;
  styles?: {
    rootStyle?: React.CSSProperties;
    idStyle?: React.CSSProperties;
    nameStyle?: React.CSSProperties;
  };
  text?: string | ((model: RegionModel) => string);
}

/**
 * 툴팁 컴포넌트
 *
 * - 호버된 지역(RegionFeature)의 정보를 표시합니다.
 * - 툴팁은 HTML로 구현되었으며, props를 통해 tooltip 내용을 커스터마이징할 수 있습니다.
 * - 툴팁은 호버된 객체의 데이터를 참조할 수 있습니다.
 */
export function Tooltip({ text, style, styles }: TooltipOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const registerTooltipRef = useMainStore((s) => s.registerTooltipRef);
  const hoveredRegion = useMainStore((s) => s.hoveredRegion);
  const tooltipLabel = useMemo(() => {
    if (!hoveredRegion) {
      return '';
    }

    if (!text) {
      return hoveredRegion?.name;
    }

    if (typeof text === 'function') {
      return text(hoveredRegion);
    }

    return text;
  }, [hoveredRegion, text]);

  useEffect(() => {
    if (ref.current) {
      registerTooltipRef(ref);
    }
  }, [ref]);

  return (
    <div
      ref={ref}
      className={classnames('hyperglobe-tooltip', classes.tooltip)}
      style={{
        ...style,
        ...styles?.rootStyle,
        visibility: hoveredRegion ? 'visible' : 'hidden',
      }}
    >
      <div style={{ ...styles?.idStyle }}>{hoveredRegion?.id}</div>
      <div style={{ fontSize: 18, ...styles?.nameStyle }}>{tooltipLabel}</div>
    </div>
  );
}
