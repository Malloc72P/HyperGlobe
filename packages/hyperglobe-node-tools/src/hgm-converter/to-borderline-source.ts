import { FeaturePolygons, RawBorderlineSource } from '@hyperglobe/interfaces';
import { typedArrayToBase64 } from '../file';
import { MathConstants, CoordinateConverter } from '@hyperglobe/tools';

/**
 * 하나의 피쳐의 폴리곤 정보를 외곽선 소스로 변환합니다.
 */
export function toBorderlineSource(featurePolygons: FeaturePolygons[]): RawBorderlineSource {
  const strokeRadius = MathConstants.FEATURE_STROKE_Z_INDEX;
  const base64Polygons: string[] = [];

  // 각 폴리곤을 구면에 변환하고, 외곽선의 정점 위치 계산
  for (const polygon of featurePolygons) {
    const positions: number[] = [];
    const convertedPoints = CoordinateConverter.converts(polygon, strokeRadius);

    // 이 폴리곤 내부에서만 선분 생성
    for (let i = 0; i < convertedPoints.length; i++) {
      const point = convertedPoints[i];
      const nextIndex = (i + 1) % convertedPoints.length;
      const nextPoint = convertedPoints[nextIndex];

      if (!point || !nextPoint) continue;

      // x, y, z 좌표 추가
      positions.push(...point);
      positions.push(...nextPoint);
    }

    base64Polygons.push(typedArrayToBase64(new Float32Array(positions)));
  }

  return {
    p: base64Polygons,
  };
}
