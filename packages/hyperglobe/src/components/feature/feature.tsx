import { useMemo } from 'react';
import type { Coordinate, VectorCoordinate } from '../../types/coordinate';
import { OrthographicProj } from '../../lib/projections/orthographic';
import { Line, Point } from '@react-three/drei';
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
    const _projectedVectors = coordinates.map((c) => OrthographicProj.project(c, 1.01));
    const projectedVectors = [..._projectedVectors, _projectedVectors[0]];
    const interpolatedVectors: VectorCoordinate[] = [];

    // 2. 3D 벡터를 선형 보간하여 부드러운 곡선 생성
    for (let i = 0; i < projectedVectors.length - 1; i++) {
      const start = projectedVectors[i];
      const end = projectedVectors[i + 1];
      const interpolated = OrthographicProj.interpolate(start, end, 10);
      interpolatedVectors.push(...interpolated);
    }

    return interpolatedVectors;
  }, [coordinates]);

  return <Line points={vectors} color="red" lineWidth={5} />;
}
