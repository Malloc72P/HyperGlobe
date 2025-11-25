import { Vector3 } from 'three';

/**
 * 높이 프로필 적용 (부드러운 포물선 프로필)
 */
export function applyHeight(
  pathPoints: Vector3[],
  minHeight: number,
  maxHeight: number,
  segments: number
): void {
  for (let i = 0; i < pathPoints.length; i++) {
    const point = pathPoints[i];

    if (!point) continue;

    // 0 ~ 1로 정규화
    const t = i / segments;

    // Sin 함수로 부드러운 포물선 (0 → 1 → 0)
    // sin(πt)는 0에서 시작해서 0.5에서 최대값 1, 1에서 다시 0
    const heightFactor = Math.sin(t * Math.PI);

    const height = minHeight + (maxHeight - minHeight) * heightFactor;
    const currentRadius = point.length();
    point.multiplyScalar((currentRadius + height) / currentRadius);
  }
}
