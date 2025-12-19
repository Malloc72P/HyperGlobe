import { PointerEventHandler, useCallback } from 'react';
import { useThrottle } from 'src/hooks/use-throttle';
import { UpdateTooltipPositionFnParam } from 'src/store';
import { TooltipConfig } from 'src/types';

export interface UseTooltipPositionProps {
  tooltipConfig: TooltipConfig | null;
  rootElementRef: React.RefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLElement | null> | null;
}

export function useTooltipPosition({
  tooltipConfig,
  rootElementRef,
  tooltipRef,
}: UseTooltipPositionProps) {
  // === Tooltip Position ===
  const getTooltipPosition = useCallback(
    ({ point, tooltipElement }: UpdateTooltipPositionFnParam) => {
      const tooltipOffset = tooltipConfig?.distance ?? 10;
      const rootElement = rootElementRef.current;

      if (!rootElement || !tooltipElement) return null;

      const rootRect = rootElement.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();
      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;

      const nextPosition = {
        x: point[0] - rootRect.left,
        y: point[1] - rootRect.top,
      };

      nextPosition.x = nextPosition.x - tooltipWidth / 2;
      nextPosition.y = nextPosition.y - tooltipHeight - tooltipOffset;

      return nextPosition;
    },
    [tooltipConfig?.distance]
  );

  const onPointerMove = useThrottle({
    fn: (e) => {
      const tooltipElement = tooltipRef?.current as HTMLDivElement;
      const { clientX, clientY } = e;

      if (!tooltipElement) return;

      const tooltipPosition = getTooltipPosition({
        point: [clientX, clientY],
        tooltipElement,
      });

      if (tooltipPosition) {
        const { x, y } = tooltipPosition;
        tooltipElement.style.transform = `translate(${x}px, ${y}px)`;
      }
    },
    delay: 50,
  }) as PointerEventHandler<HTMLDivElement>;

  return [onPointerMove];
}
