import type { Coordinate, VectorCoordinate } from '../../types/coordinate';

/**
 * 경위도 좌표를 3차원 직교좌표계의 좌표로 투영합니다.
 *
 * @param coordinate - [경도, 위도] 형태의 좌표 (단위: 도)
 * @param radius - 구의 반지름 (기본값: 1)
 * @returns [x, y, z] 형태의 3차원 직교좌표
 *
 * @example
 * ```ts
 * // 경도 0도, 위도 0도 (아프리카 기니만 앞바다)
 * project([0, 0]); // [1, 0, 0]
 *
 * // 경도 90도, 위도 0도 (인도양)
 * project([90, 0]); // [0, 0, 1]
 *
 * // 경도 0도, 위도 90도 (북극점)
 * project([0, 90]); // [0, 1, 0]
 * ```
 */
function project(coordinate: Coordinate, radius = 1): VectorCoordinate {
  const [longitude, latitude] = coordinate;

  // 도(degree)를 라디안(radian)으로 변환
  const phi = (longitude * Math.PI) / 180;
  const theta = (latitude * Math.PI) / 180;

  // 구면 좌표계를 직교 좌표계로 변환
  // x축: 경도 0도, 위도 0도 방향
  // y축: 북극 방향
  // z축: 경도 90도, 위도 0도 방향
  const x = radius * Math.cos(theta) * Math.cos(phi);
  const y = radius * Math.sin(theta);
  const z = radius * Math.cos(theta) * Math.sin(phi);

  return [x, y, z];
}

/**
 * 두 3D 벡터 사이를 구면을 따라 보간합니다.
 *
 * @param start - 시작 벡터 [x, y, z]
 * @param end - 끝 벡터 [x, y, z]
 * @param segments - 세그먼트 개수 (기본값: 10)
 * @param radius - 구의 반지름 (기본값: 1)
 * @returns 보간된 벡터들의 배열
 *
 * @example
 * ```ts
 * const start: VectorCoordinate = [1, 0, 0];
 * const end: VectorCoordinate = [0, 1, 0];
 * const interpolated = interpolate(start, end, 5);
 * // 두 점 사이를 5개 세그먼트로 나눈 점들 반환
 * ```
 */
function interpolate(
  start: VectorCoordinate,
  end: VectorCoordinate,
  segments = 10,
  radius = 1
): VectorCoordinate[] {
  const result: VectorCoordinate[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    // 선형 보간
    const x = start[0] + (end[0] - start[0]) * t;
    const y = start[1] + (end[1] - start[1]) * t;
    const z = start[2] + (end[2] - start[2]) * t;

    // 벡터의 길이(magnitude) 계산
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    // 정규화 후 반지름 적용 (구 표면에 투영)
    const normalized: VectorCoordinate = [
      (x / magnitude) * radius,
      (y / magnitude) * radius,
      (z / magnitude) * radius,
    ];

    result.push(normalized);
  }

  return result;
}

export const OrthographicProj = {
  project,
  interpolate,
};
