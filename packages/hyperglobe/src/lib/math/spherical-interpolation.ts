import type { VectorCoordinate } from '../../types/coordinate';

/**
 * 두 구면 좌표 사이의 중점을 구면 보간(spherical interpolation)으로 계산
 *
 * 단순히 (a + b) / 2를 하면 구면에서 정확한 중점이 아니므로,
 * 구면 위의 최단 경로(great circle)의 중점을 계산합니다.
 *
 * @param a 첫 번째 3D 벡터 좌표
 * @param b 두 번째 3D 벡터 좌표
 * @param radius 구의 반지름
 * @returns 구면 위의 중점 좌표
 */
export function sphericalMidpoint(
  a: VectorCoordinate,
  b: VectorCoordinate,
  radius: number
): VectorCoordinate {
  // 1. 벡터를 정규화 (단위 벡터로 만들기)
  const lenA = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
  const lenB = Math.sqrt(b[0] * b[0] + b[1] * b[1] + b[2] * b[2]);

  const unitA: VectorCoordinate = [a[0] / lenA, a[1] / lenA, a[2] / lenA];
  const unitB: VectorCoordinate = [b[0] / lenB, b[1] / lenB, b[2] / lenB];

  // 2. 두 단위 벡터의 내적으로 사잇각 계산
  const dot = unitA[0] * unitB[0] + unitA[1] * unitB[1] + unitA[2] * unitB[2];

  // 3. 두 벡터가 거의 같은 방향인 경우 (dot ≈ 1)
  if (dot > 0.9999) {
    // 단순 평균으로도 충분히 정확
    const mid: VectorCoordinate = [(a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5];

    // 구 표면으로 정규화
    const len = Math.sqrt(mid[0] * mid[0] + mid[1] * mid[1] + mid[2] * mid[2]);
    return [(mid[0] / len) * radius, (mid[1] / len) * radius, (mid[2] / len) * radius];
  }

  // 4. 두 벡터가 정반대 방향인 경우 (dot ≈ -1)
  if (dot < -0.9999) {
    // 임의의 수직 벡터를 찾아서 중점으로 사용
    let perpendicular: VectorCoordinate;

    if (Math.abs(unitA[0]) < 0.9) {
      perpendicular = [1, 0, 0];
    } else {
      perpendicular = [0, 1, 0];
    }

    // 외적으로 수직 벡터 계산
    const cross: VectorCoordinate = [
      unitA[1] * perpendicular[2] - unitA[2] * perpendicular[1],
      unitA[2] * perpendicular[0] - unitA[0] * perpendicular[2],
      unitA[0] * perpendicular[1] - unitA[1] * perpendicular[0],
    ];

    // 정규화
    const crossLen = Math.sqrt(cross[0] * cross[0] + cross[1] * cross[1] + cross[2] * cross[2]);
    return [
      (cross[0] / crossLen) * radius,
      (cross[1] / crossLen) * radius,
      (cross[2] / crossLen) * radius,
    ];
  }

  // 5. 일반적인 경우: 구면 선형 보간(Spherical Linear Interpolation)
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
  const sinAngle = Math.sin(angle);

  // t = 0.5 (중점)에서의 보간
  const t = 0.5;
  const ratioA = Math.sin((1 - t) * angle) / sinAngle;
  const ratioB = Math.sin(t * angle) / sinAngle;

  const interpolated: VectorCoordinate = [
    ratioA * unitA[0] + ratioB * unitB[0],
    ratioA * unitA[1] + ratioB * unitB[1],
    ratioA * unitA[2] + ratioB * unitB[2],
  ];

  // 6. 반지름 적용
  return [interpolated[0] * radius, interpolated[1] * radius, interpolated[2] * radius];
}

/**
 * 두 3D 벡터 사이의 거리 계산
 *
 * @param a 첫 번째 벡터
 * @param b 두 번째 벡터
 * @returns 유클리드 거리
 */
export function vectorDistance(a: VectorCoordinate, b: VectorCoordinate): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 삼각형의 면적 계산 (3D 공간에서)
 *
 * @param a 첫 번째 꼭짓점
 * @param b 두 번째 꼭짓점
 * @param c 세 번째 꼭짓점
 * @returns 삼각형의 면적
 */
export function triangleArea(
  a: VectorCoordinate,
  b: VectorCoordinate,
  c: VectorCoordinate
): number {
  // 두 변의 벡터 계산
  const ab: VectorCoordinate = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac: VectorCoordinate = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];

  // 외적 계산
  const cross: VectorCoordinate = [
    ab[1] * ac[2] - ab[2] * ac[1],
    ab[2] * ac[0] - ab[0] * ac[2],
    ab[0] * ac[1] - ab[1] * ac[0],
  ];

  // 외적의 크기의 절반이 삼각형 면적
  const crossLength = Math.sqrt(cross[0] * cross[0] + cross[1] * cross[1] + cross[2] * cross[2]);
  return crossLength * 0.5;
}
