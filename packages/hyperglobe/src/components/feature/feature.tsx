import { useMemo } from 'react';
import type { Coordinate, VectorCoordinate } from '../../types/coordinate';
import { OrthographicProj } from '../../lib/projections/orthographic';
import { Line } from '@react-three/drei';
import { DummyFeature } from './dummy';

export interface FeatureProps {
  coordinates?: Coordinate[];
}

export function Feature({ coordinates = DummyFeature }: FeatureProps) {
  const vectors = useMemo<VectorCoordinate[]>(() => {
    if (coordinates.length === 0) {
      return [];
    }

    // 1. 경위도 좌표를 3D 벡터로 변환
    const projectedVectors = coordinates.map((c) => OrthographicProj.project(c, 1.01));

    // 2. 각 선분을 구면을 따라 보간
    const interpolatedVectors: VectorCoordinate[] = [];

    for (let i = 0; i < projectedVectors.length; i++) {
      const start = projectedVectors[i];
      const end = projectedVectors[(i + 1) % projectedVectors.length];

      // 구면 보간 (마지막 점 제외하여 중복 방지)
      const segment = OrthographicProj.interpolate(start, end, 10);
      interpolatedVectors.push(...segment.slice(0, -1));
    }

    return interpolatedVectors;
  }, [coordinates]);

  return <Line points={vectors} color="red" lineWidth={2} />;
}
