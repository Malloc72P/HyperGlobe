import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import { OrthographicProj } from '../../lib/projections/orthographic';
import type { Coordinate, VectorCoordinate } from '../../types/coordinate';
import { LineFeature } from '../line-feature/line-feature';

export interface RectangleFeatureProps {
  /**
   * 사각형 좌표 배열.
   *
   * - 네 개의 경위도 좌표를 순서대로 지정해야 합니다.
   * - 순서대로 좌상단, 우상단, 우하단, 좌하단 좌표를 입력합니다.
   */
  coordinates: [Coordinate, Coordinate, Coordinate, Coordinate];

  /**
   * 선 색상
   */
  color?: string;

  /**
   * 선 두께
   */
  lineWidth?: number;
}

export function RectangleFeature({
  coordinates,
  color = 'red',
  lineWidth = 2,
}: RectangleFeatureProps) {
  return (
    <group>
      <LineFeature
        coordinates={[coordinates[0], coordinates[1]]}
        color={color}
        lineWidth={lineWidth}
      />
      <LineFeature
        coordinates={[coordinates[1], coordinates[2]]}
        color={color}
        lineWidth={lineWidth}
      />
      <LineFeature
        coordinates={[coordinates[2], coordinates[3]]}
        color={color}
        lineWidth={lineWidth}
      />
      <LineFeature
        coordinates={[coordinates[3], coordinates[0]]}
        color={color}
        lineWidth={lineWidth}
      />
    </group>
  );
}
