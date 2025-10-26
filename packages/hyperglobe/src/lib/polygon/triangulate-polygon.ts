import earcut from 'earcut';
import { OrthographicProj } from '../projections/orthographic';
import type { Coordinate, VectorCoordinate } from '../../types/coordinate';

export interface TriangulatePolygonOptions {
  /**
   * 폴리곤 좌표 배열 (경위도)
   */
  coordinates: Coordinate[];

  /**
   * 구의 반지름
   */
  radius: number;
}

export interface TriangulatePolygonResult {
  /**
   * 3D 좌표 배열 (구면 위의 점들)
   */
  vertices: VectorCoordinate[];

  /**
   * 삼각형 인덱스 배열
   * 3개씩 묶어서 하나의 삼각형을 구성
   */
  indices: number[];
}

/**
 * GeoJSON 폴리곤 좌표를 삼각분할하여 3D 메시 데이터 생성
 *
 * @param options - 폴리곤 좌표와 반지름
 * @returns 3D 좌표 배열과 삼각형 인덱스 배열
 *
 * @example
 * ```ts
 * const result = triangulatePolygon({
 *   coordinates: [[0, 0], [10, 0], [10, 10], [0, 10]],
 *   radius: 1.005
 * });
 * // result.vertices: [[x1,y1,z1], [x2,y2,z2], ...]
 * // result.indices: [0,1,2, 2,3,0] (삼각형 2개)
 * ```
 */
export function triangulatePolygon({
  coordinates,
  radius,
}: TriangulatePolygonOptions): TriangulatePolygonResult {
  // 1. Earcut은 flat array를 요구: [x1, y1, x2, y2, ...]
  const flatCoords = coordinates.flatMap((coord) => [coord[0], coord[1]]);

  // 2. Earcut으로 삼각분할 수행
  // 반환값: [i1, i2, i3, i4, i5, i6, ...] (각 3개씩 하나의 삼각형)
  const indices = earcut(flatCoords);

  // 3. 경위도 좌표를 3D 구면 좌표로 변환
  const vertices = OrthographicProj.projects(coordinates, radius);

  return {
    vertices,
    indices,
  };
}
