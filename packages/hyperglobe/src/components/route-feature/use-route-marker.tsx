import { useMemo } from 'react';
import { RoutePoint } from './route-feature';
import { MarkerProps } from '../marker-feature/marker';

export interface UseRouteMarkerProps {
  point: RoutePoint;
}

export function useRouteMarker({ point }: UseRouteMarkerProps) {
  const marker = useMemo<MarkerProps>(() => {
    return {
      marker: {
        position: point.coordinate,
        label: point.label,
      },
    };
  }, [point]);

  return [marker];
}
