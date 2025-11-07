import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import { OrthographicProj } from '@hyperglobe/math';
import type { Coordinate, VectorCoordinate } from '@hyperglobe/interfaces';
import { UiConstant } from '../../constants';

export interface LineFeatureProps {
  /**
   * 선을 구성하는 좌표 배열
   */
  coordinates: Coordinate[];
  /**
   * 선 색상
   */
  color?: string;
  /**
   * 선 두께
   */
  lineWidth?: number;
  /**
   * z 좌표 (고도, 구 표면에서 얼마나 떨어질지 여부)
   *
   * - 1은 구 표면과 동일한 높이. 이 경우 구 표면과 겹쳐져서 안보이거나 깜빡일 수 있음.
   * - 1보다 크면 구 표면에서 떨어진 높이
   * - 1보다 작으면 구 표면 안쪽 높이. 이 경우 구표면에 가려져서 안보일 수 있음.
   *
   * @default 1.0001
   */
  z?: number;
}

export function LineFeature({
  coordinates,
  color = 'red',
  lineWidth = 2,
  z = UiConstant.feature.strokeRadius,
}: LineFeatureProps) {
  const vectors = useMemo<VectorCoordinate[]>(() => {
    // 1. 경위도 좌표를 3D 벡터로 변환
    return OrthographicProj.projects(coordinates, z);
  }, [coordinates]);

  return <Line points={vectors} color={color} lineWidth={lineWidth} />;
}
