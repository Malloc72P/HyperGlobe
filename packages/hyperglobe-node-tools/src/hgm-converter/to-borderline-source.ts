import { FeaturePolygons, RawBorderlineSource } from '@hyperglobe/interfaces';
import { typedArrayToBase64 } from '../file';
import { MathConstants, OrthographicProj } from '@hyperglobe/tools';

export function toBorderlineSource(featurePolygons: FeaturePolygons[]): RawBorderlineSource {
  const strokeRadius = MathConstants.FEATURE_STROKE_Z_INDEX;
  const positions: number[] = [];

  // 각 폴리곤을 구면에 투영하고, 외곽선의 정점 위치 계산
  for (const polygon of featurePolygons) {
    const projectedPoints = OrthographicProj.projects(polygon, strokeRadius);

    // 이 폴리곤 내부에서만 선분 생성
    for (let i = 0; i < projectedPoints.length; i++) {
      const point = projectedPoints[i];
      const nextIndex = (i + 1) % projectedPoints.length;
      const nextPoint = projectedPoints[nextIndex];

      if (!point || !nextPoint) continue;

      // x, y, z 좌표 추가
      positions.push(...point);
      positions.push(...nextPoint);
    }
  }

  return {
    // p: positions,
    p: typedArrayToBase64(new Float32Array(positions)),
  };
}
