import { useEffect, useMemo, useRef } from 'react';
import { useMainStore } from '../../store';
import classes from './tooltip.module.css';
import { classnames } from '../../lib/css';
import type { RegionModel } from '@hyperglobe/interfaces';

export interface TooltipOptions {
  /**
   * 툴팁의 최상위 div 스타일
   */
  style?: React.CSSProperties;
  /**
   * 툴팁의 세부 요소 스타일
   */
  styles?: {
    rootStyle?: React.CSSProperties;
    idStyle?: React.CSSProperties;
    nameStyle?: React.CSSProperties;
  };
  /**
   * 툴팁과 마우스 커서 사이의 거리 (픽셀 단위)
   */
  distance?: number;
  /**
   * 툴팁에 표시할 텍스트
   */
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
      <div className={classes.id} style={{ ...styles?.idStyle }}>
        {hoveredRegion?.id}
      </div>
      <div className={classes.name} style={{ ...styles?.nameStyle }}>
        {tooltipLabel}
      </div>
    </div>
  );
}
