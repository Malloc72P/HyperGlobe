import type { Coordinate, VectorCoordinate } from '../../types/coordinate';
import { delaunayTriangulate } from './delaunay-triangulate';

export interface TriangulatePolygonOptions {
  /**
   * 폴리곤 좌표 배열 (경위도)
   */
  coordinates: Coordinate[];

  /**
   * 구의 반지름
   */
  radius: number;

  /**
   * 내부 격자점 간격 (도 단위)
   * 작을수록 더 촘촘한 삼각형 생성
   *
   * @default 5
   *
   * @example
   * ```tsx
   * // 기본 사용 (5도 간격)
   * <PolygonFeature gridSpacing={5} />
   *
   * // 더 촘촘하게 (2도 간격)
   * <PolygonFeature gridSpacing={2} />
   * ```
   */
  gridSpacing?: number;

  /**
   * 경계선 densification 활성화
   * simplify된 데이터에서 경계가 성글 때 유용
   *
   * @default true
   */
  densifyBoundary?: boolean;
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
 * Delaunay 삼각분할을 사용하여 균등한 크기의 삼각형 생성
 *
 * @param options - 폴리곤 좌표와 반지름, 격자 간격
 * @returns 3D 좌표 배열과 삼각형 인덱스 배열
 *
 * @example
 * ```ts
 * // 기본 사용 (5도 간격)
 * const result = triangulatePolygon({
 *   coordinates: [[0, 0], [10, 0], [10, 10], [0, 10]],
 *   radius: 1.005
 * });
 *
 * // 더 촘촘하게 (2도 간격)
 * const result = triangulatePolygon({
 *   coordinates: [[0, 0], [10, 0], [10, 10], [0, 10]],
 *   radius: 1.005,
 *   gridSpacing: 2
 * });
 *
 * // 경계선 보간 비활성화
 * const result = triangulatePolygon({
 *   coordinates: [[0, 0], [10, 0], [10, 10], [0, 10]],
 *   radius: 1.005,
 *   densifyBoundary: false
 * });
 * ```
 */
export function triangulatePolygon({
  coordinates,
  radius,
  gridSpacing = 5,
  densifyBoundary = true,
}: TriangulatePolygonOptions): TriangulatePolygonResult {
  return delaunayTriangulate({
    coordinates,
    radius,
    gridSpacing,
    densifyBoundary,
  });
}
