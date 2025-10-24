import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import { OrthographicProj } from '../../lib/projections/orthographic';
import type { Coordinate, VectorCoordinate } from '../../types/coordinate';

export interface LineFeatureProps {
  /**
   * 시작점과 끝점의 경위도 좌표 배열
   */
  coordinates: [Coordinate, Coordinate];

  /**
   * 선 색상
   */
  color?: string;

  /**
   * 선 두께
   */
  lineWidth?: number;
}

export function LineFeature({ coordinates, color = 'red', lineWidth = 2 }: LineFeatureProps) {
  const vectors = useMemo<VectorCoordinate[]>(() => {
    // 1. 경위도 좌표를 3D 벡터로 변환
    const projectedVectors = coordinates.map((c) => OrthographicProj.project(c, 1.01));
    const interpolatedVectors: VectorCoordinate[] = [];

    // 2. 3D 벡터를 선형 보간하여 부드러운 곡선 생성
    const start = projectedVectors[0];
    const end = projectedVectors[1];
    const interpolated = OrthographicProj.interpolate(start, end, 10);
    interpolatedVectors.push(...interpolated);

    return interpolatedVectors;
  }, [coordinates]);

  return <Line points={vectors} color={color} lineWidth={lineWidth} />;
}
