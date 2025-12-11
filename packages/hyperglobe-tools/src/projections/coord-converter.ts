import type { Coordinate, VectorCoordinate } from '@hyperglobe/interfaces';
import { toRadian } from '../math/to-radian';
import { magnitude3D } from '../math/magnitude';

export class CoordinateConverter {
  /**
   * 경위도 좌표를 3차원 직교좌표계의 좌표로 변환합니다.
   *
   * @param coordinate - [경도, 위도] 형태의 좌표 (단위: 도)
   * @param radius - 구의 반지름 (기본값: 1)
   * @returns [x, y, z] 형태의 3차원 직교좌표
   *
   * @example
   * ```ts
   * // 경도 0도, 위도 0도 (아프리카 기니만 앞바다)
   * convert([0, 0]); // [1, 0, 0]
   *
   * // 경도 90도, 위도 0도 (인도양)
   * convert([90, 0]); // [0, 0, 1]
   *
   * // 경도 0도, 위도 90도 (북극점)
   * convert([0, 90]); // [0, 1, 0]
   * ```
   */
  public static convert(coordinate: Coordinate, radius = 1): VectorCoordinate {
    const longitude = -1 * coordinate[0];
    const latitude = coordinate[1];

    // 도(degree)를 라디안(radian)으로 변환
    const phi = toRadian(longitude);
    const theta = toRadian(latitude);

    // 구면 좌표계를 직교 좌표계로 변환
    // x축: 경도 0도, 위도 0도 방향
    // y축: 북극 방향
    // z축: 경도 90도, 위도 0도 방향
    const x = radius * Math.cos(theta) * Math.cos(phi);
    const y = radius * Math.sin(theta);
    const z = radius * Math.cos(theta) * Math.sin(phi);

    return [x, y, z];
  }

  public static converts(coordinates: Coordinate[], radius = 1): VectorCoordinate[] {
    return coordinates.map((coord) => this.convert(coord, radius));
  }

  /**
   * 3차원 직교좌표를 경위도 좌표로 역변환합니다.
   *
   * @param vector - [x, y, z] 형태의 3차원 직교좌표
   * @param radius - 구의 반지름 (기본값: 1)
   * @returns [경도, 위도] 형태의 좌표 (단위: 도)
   *
   * @example
   * ```ts
   * // [1, 0, 0] → 경도 0도, 위도 0도
   * invert([1, 0, 0]); // [0, 0]
   *
   * // [0, 0, 1] → 경도 90도, 위도 0도
   * invert([0, 0, 1]); // [90, 0]
   *
   * // [0, 1, 0] → 경도 0도, 위도 90도 (북극점)
   * invert([0, 1, 0]); // [0, 90]
   * ```
   */
  public static invert(vector: VectorCoordinate, radius = 1): Coordinate {
    const [x, y, z] = vector;

    // 정규화 (반지름이 1이 아닐 경우를 대비)
    const normalizedX = x / radius;
    const normalizedY = y / radius;
    const normalizedZ = z / radius;

    // 위도 계산: arcsin(y)
    const latitude = Math.asin(normalizedY) * (180 / Math.PI);

    // 경도 계산: arctan2(z, x)
    const longitude = Math.atan2(normalizedZ, normalizedX) * (180 / Math.PI);

    // convert 함수에서 경도에 -1을 곱했으므로, 역변환 시 다시 -1을 곱함
    return [-longitude, latitude];
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
   * // 두 점 사이를 세그먼트로 나눈 점들 반환
   * ```
   */
  public static interpolate(
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
      const mag = magnitude3D([x, y, z]);

      // 정규화 후 반지름 적용 (구 표면에 투영)
      const normalized: VectorCoordinate = [
        (x / mag) * radius,
        (y / mag) * radius,
        (z / mag) * radius,
      ];

      result.push(normalized);
    }

    return result;
  }

  public static interpolates(
    coordinatePairs: [VectorCoordinate, VectorCoordinate][],
    segments = 10,
    radius = 1
  ) {
    return coordinatePairs.map(([start, end]) => this.interpolate(start, end, segments, radius));
  }
}
