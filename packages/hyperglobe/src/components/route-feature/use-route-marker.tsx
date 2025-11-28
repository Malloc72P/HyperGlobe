import { useMemo } from 'react';
import { RoutePoint } from './route-feature';
import { MarkerFeatureProps } from '../marker-feature/marker-feature';

export interface UseRouteMarkerProps {
  point: RoutePoint;
}

export function useRouteMarker({ point }: UseRouteMarkerProps) {
  const marker = useMemo<MarkerFeatureProps>(() => {
    return {
      coordinate: point.coordinate,
      label: point.label,
      style: point.style,
    };
  }, [point]);

  return [marker];
}
