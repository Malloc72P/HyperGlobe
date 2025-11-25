import { Coordinate } from '@hyperglobe/interfaces';
import { createGreatCirclePath, applyHeight } from '@hyperglobe/tools';
import { useMemo } from 'react';
import { BufferGeometry, ConeGeometry } from 'three';

export interface UseRouteGeometryProps {
  from: Coordinate;
  to: Coordinate;
  minHeight: number;
  maxHeight: number;
  segments: number;
}

export function useRouteGeometry({
  from,
  to,
  minHeight,
  maxHeight,
  segments,
}: UseRouteGeometryProps) {
  const objectGeometry = useMemo(() => {
    let geo: BufferGeometry;

    geo = new ConeGeometry(0.02, 0.06, 8);
    geo.rotateX(-Math.PI / 2);

    return geo;
  }, []);

  // 1. 전체 경로를 미리 계산
  const fullPathPoints = useMemo(() => {
    const points = createGreatCirclePath(from, to, segments);
    applyHeight(points, minHeight, maxHeight, segments);
    return points;
  }, [from, to, minHeight, maxHeight, segments]);

  return { fullPathPoints, objectGeometry };
}
