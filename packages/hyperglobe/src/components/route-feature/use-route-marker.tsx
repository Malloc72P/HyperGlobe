import { useMemo } from 'react';
import { RoutePoint } from './route-feature';
import { MarkerFeatureProps } from '../marker-feature/marker-feature';

export interface UseRouteMarkerProps {
  point: RoutePoint;
}

export function useRouteMarker({ point }: UseRouteMarkerProps) {
  const marker = useMemo<MarkerFeatureProps>(() => {
    return {
      marker: {
        position: point.coordinate,
        label: point.label,
        stroke: point.stroke,
        fill: point.fill,
      },
    };
  }, [point]);

  return [marker];
}
