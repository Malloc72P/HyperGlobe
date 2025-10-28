import type { VectorCoordinate } from '../../types/coordinate';

/**
 * 두 벡터의 내적(dot product) 계산
 */
export function dot(a: VectorCoordinate, b: VectorCoordinate): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * 두 벡터의 외적(cross product) 계산
 */
export function cross(a: VectorCoordinate, b: VectorCoordinate): VectorCoordinate {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/**
 * 벡터의 크기(magnitude) 계산
 */
export function magnitude(v: VectorCoordinate): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

/**
 * 벡터 정규화 (단위 벡터로 변환)
 */
export function normalize(v: VectorCoordinate): VectorCoordinate {
  const mag = magnitude(v);
  if (mag === 0) return [0, 0, 0];
  return [v[0] / mag, v[1] / mag, v[2] / mag];
}

/**
 * 두 3D 벡터 사이의 각도 계산 (라디안)
 *
 * @param a - 첫 번째 벡터
 * @param b - 두 번째 벡터
 * @returns 두 벡터 사이의 각도 (0 ~ π)
 */
export function angleBetweenVectors(a: VectorCoordinate, b: VectorCoordinate): number {
  const dotProduct = dot(normalize(a), normalize(b));
  // 부동소수점 오차로 인한 acos 범위 오류 방지
  const clampedDot = Math.max(-1, Math.min(1, dotProduct));
  return Math.acos(clampedDot);
}

/**
 * 구면 위의 세 점이 이루는 부호있는 면적 계산
 *
 * 양수: 반시계방향(CCW)
 * 음수: 시계방향(CW)
 * 0: 일직선
 *
 * @param a - 첫 번째 점
 * @param b - 두 번째 점
 * @param c - 세 번째 점
 * @returns 부호있는 면적
 */
export function sphericalTriangleSignedArea(
  a: VectorCoordinate,
  b: VectorCoordinate,
  c: VectorCoordinate
): number {
  // 구면 삼각형의 면적은 외적을 이용해 계산
  // Triple product: (a × b) · c
  const crossAB = cross(a, b);
  const areaSign = dot(crossAB, c);

  return areaSign;
}

/**
 * 구면 폴리곤의 방향(winding) 판정
 *
 * @param vertices - 폴리곤의 정점들 (3D 좌표)
 * @returns true: 반시계방향(CCW), false: 시계방향(CW)
 */
export function isCounterClockwise(vertices: VectorCoordinate[]): boolean {
  if (vertices.length < 3) return true;

  // Newell 방법: 폴리곤의 법선 벡터 계산
  const normal: VectorCoordinate = [0, 0, 0];

  for (let i = 0; i < vertices.length; i++) {
    const curr = vertices[i];
    const next = vertices[(i + 1) % vertices.length];

    normal[0] += (curr[1] - next[1]) * (curr[2] + next[2]);
    normal[1] += (curr[2] - next[2]) * (curr[0] + next[0]);
    normal[2] += (curr[0] - next[0]) * (curr[1] + next[1]);
  }

  // 폴리곤 중심점 계산 (평균)
  const center: VectorCoordinate = [0, 0, 0];
  for (const v of vertices) {
    center[0] += v[0];
    center[1] += v[1];
    center[2] += v[2];
  }
  center[0] /= vertices.length;
  center[1] /= vertices.length;
  center[2] /= vertices.length;

  // 법선 벡터와 중심점의 내적
  // 양수면 법선이 구 바깥쪽을 향함 (CCW)
  // 음수면 법선이 구 안쪽을 향함 (CW)
  const dotProduct = dot(normal, center);

  return dotProduct > 0;
}

/**
 * 점 p가 구면 삼각형 abc 내부에 있는지 확인
 *
 * @param p - 확인할 점
 * @param a - 삼각형 첫 번째 꼭짓점
 * @param b - 삼각형 두 번째 꼭짓점
 * @param c - 삼각형 세 번째 꼭짓점
 * @returns true: 내부에 있음, false: 외부에 있음
 */
export function isPointInSphericalTriangle(
  p: VectorCoordinate,
  a: VectorCoordinate,
  b: VectorCoordinate,
  c: VectorCoordinate
): boolean {
  // 부동소수점 오차 허용 범위
  const EPSILON = 1e-10;

  // 각 변에 대해 점이 같은 쪽에 있는지 확인
  const sign1 = sphericalTriangleSignedArea(a, b, p);
  const sign2 = sphericalTriangleSignedArea(b, c, p);
  const sign3 = sphericalTriangleSignedArea(c, a, p);

  // 엡실론을 고려한 부호 판정
  const hasNeg = sign1 < -EPSILON || sign2 < -EPSILON || sign3 < -EPSILON;
  const hasPos = sign1 > EPSILON || sign2 > EPSILON || sign3 > EPSILON;

  // 모두 같은 부호(또는 0)면 내부에 있음
  return !(hasNeg && hasPos);
}

/**
 * 세 점이 구면에서 귀(ear)를 형성하는지 확인
 *
 * Ear: 제거해도 폴리곤이 유효한 상태로 유지되는 삼각형
 *
 * @param prevIdx - 이전 점의 인덱스
 * @param currIdx - 현재 점의 인덱스 (ear의 중심)
 * @param nextIdx - 다음 점의 인덱스
 * @param vertices - 전체 폴리곤 정점들
 * @param indices - 현재 남아있는 정점 인덱스들
 * @returns true: ear임, false: ear가 아님
 */
export function isEar(
  prevIdx: number,
  currIdx: number,
  nextIdx: number,
  vertices: VectorCoordinate[],
  indices: number[]
): boolean {
  const EPSILON = 1e-8;

  const prev = vertices[prevIdx];
  const current = vertices[currIdx];
  const next = vertices[nextIdx];

  // 1. 삼각형이 올바른 방향(CCW)인지 확인
  const area = sphericalTriangleSignedArea(prev, current, next);
  if (area <= EPSILON) {
    // 시계방향이거나 일직선이면 ear가 아님
    return false;
  }

  // 2. 다른 점들이 이 삼각형 내부에 있는지 확인
  for (const idx of indices) {
    // 삼각형의 꼭짓점은 제외
    if (idx === prevIdx || idx === currIdx || idx === nextIdx) {
      continue;
    }

    const vertex = vertices[idx];

    // 다른 점이 삼각형 내부에 엄격하게 있으면 ear가 아님
    if (isPointStrictlyInsideSphericalTriangle(vertex, prev, current, next)) {
      return false;
    }
  }

  return true;
}

/**
 * 점 p가 구면 삼각형 abc의 내부에 엄격하게(경계 제외) 있는지 확인
 */
function isPointStrictlyInsideSphericalTriangle(
  p: VectorCoordinate,
  a: VectorCoordinate,
  b: VectorCoordinate,
  c: VectorCoordinate
): boolean {
  const EPSILON = 1e-8;

  const sign1 = sphericalTriangleSignedArea(a, b, p);
  const sign2 = sphericalTriangleSignedArea(b, c, p);
  const sign3 = sphericalTriangleSignedArea(c, a, p);

  // 모두 양수여야 내부에 엄격하게 있음 (경계는 제외)
  return sign1 > EPSILON && sign2 > EPSILON && sign3 > EPSILON;
}
