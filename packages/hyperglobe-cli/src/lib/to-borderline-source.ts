import { BorderlineSource, FeaturePolygons } from '@hyperglobe/interfaces';
import { MathConstants, OrthographicProj, roundCoordinates } from '@hyperglobe/math';

export function toBorderlineSource(featurePolygons: FeaturePolygons[]): BorderlineSource {
  const strokeRadius = MathConstants.FEATURE_STROKE_Z_INDEX;
  const positions: number[] = [];

  // 각 폴리곤을 구면에 투영하고, 외곽선의 정점 위치 계산
  for (const polygon of featurePolygons) {
    const projectedPoints = OrthographicProj.projects(polygon, strokeRadius);

    // 이 폴리곤 내부에서만 선분 생성
    for (let i = 0; i < projectedPoints.length; i++) {
      const [x1, y1, z1] = projectedPoints[i];
      // 마지막 점은 첫 점과 연결 (폴리곤 닫기)
      const nextIndex = (i + 1) % projectedPoints.length;
      const [x2, y2, z2] = projectedPoints[nextIndex];

      // 선분 추가: 시작점 -> 끝점
      positions.push(x1, y1, z1);
      positions.push(x2, y2, z2);
    }
    // 여기서 끊김! 다음 폴리곤으로 넘어감
  }

  return {
    p: positions.map(roundCoordinates),
  };
}
