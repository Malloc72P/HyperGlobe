import earcut from 'earcut';
import { OrthographicProj } from '../projections/orthographic';
import type { Coordinate, VectorCoordinate } from '../../types/coordinate';
import { subdivideTriangles, type SubdivisionOptions } from './subdivide-triangles';
import { projectToPlane } from './project-to-plane';
import { densifyBoundary, estimateMaxEdgeLength } from './densify-boundary';
import { delaunayTriangulate } from './delaunay-triangulate';

// Re-export for convenience
export type { SubdivisionOptions };

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
   * 삼각형 세분화 옵션
   * 큰 폴리곤에서 더 부드러운 곡면을 위해 사용
   */
  subdivision?: SubdivisionOptions;

  /**
   * 경계 밀집화 옵션
   * 큰 삼각형 생성을 방지하여 면이 찢어지는 현상 해결
   * true: 자동으로 적절한 maxEdgeLength 계산
   * number: 명시적인 maxEdgeLength 지정
   *
   * @deprecated useDelaunay를 사용하세요
   */
  densifyBoundary?: boolean | number;

  /**
   * Delaunay 삼각분할 사용 (권장)
   * 균등한 크기의 삼각형 생성으로 면 찢어짐 방지
   *
   * true: 기본 gridSpacing(5도) 사용
   * number: 커스텀 gridSpacing 지정 (작을수록 촘촘)
   *
   * @example
   * ```tsx
   * // 기본 사용 (권장)
   * <PolygonFeature useDelaunay />
   *
   * // 더 촘촘하게
   * <PolygonFeature useDelaunay={2} />
   * ```
   */
  useDelaunay?: boolean | number;
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
 * // 기본 사용
 * const result = triangulatePolygon({
 *   coordinates: [[0, 0], [10, 0], [10, 10], [0, 10]],
 *   radius: 1.005
 * });
 *
 * // 경계 밀집화로 큰 삼각형 방지 (자동)
 * const result = triangulatePolygon({
 *   coordinates: [[0, 0], [10, 0], [10, 10], [0, 10]],
 *   radius: 1.005,
 *   densifyBoundary: true
 * });
 *
 * // 경계 밀집화 (수동)
 * const result = triangulatePolygon({
 *   coordinates: [[0, 0], [10, 0], [10, 10], [0, 10]],
 *   radius: 1.005,
 *   densifyBoundary: 0.1  // 최대 변 길이
 * });
 * ```
 */
export function triangulatePolygon({
  coordinates,
  radius,
  subdivision,
  densifyBoundary: densifyOption,
  useDelaunay,
}: TriangulatePolygonOptions): TriangulatePolygonResult {
  // 0. Delaunay 삼각분할 사용 (권장)
  if (useDelaunay) {
    const gridSpacing = typeof useDelaunay === 'number' ? useDelaunay : 5;
    return delaunayTriangulate({
      coordinates,
      radius,
      gridSpacing,
    });
  }

  // 0. 경계 밀집화 (선택적, deprecated)
  let processedCoordinates = coordinates;
  if (densifyOption) {
    const maxEdgeLength =
      typeof densifyOption === 'number'
        ? densifyOption
        : estimateMaxEdgeLength(coordinates, radius);

    processedCoordinates = densifyBoundary(coordinates, maxEdgeLength, radius);
  }

  // 1. 경위도 좌표를 3D 구면 좌표로 변환
  const vertices = OrthographicProj.projects(processedCoordinates, radius);

  // 2. 3D 좌표를 로컬 2D 평면에 투영
  const projected2D = projectToPlane(vertices);

  // 3. 2D 좌표를 flat array로 변환
  const flatCoords = projected2D.flatMap((coord) => [coord[0], coord[1]]);

  // 4. Earcut으로 삼각분할 수행
  const indices = earcut(flatCoords);

  // 5. 세분화 옵션이 있으면 삼각형을 세분화
  if (subdivision) {
    const subdivisionResult = subdivideTriangles(vertices, indices, radius, subdivision);
    return {
      vertices: subdivisionResult.vertices,
      indices: subdivisionResult.indices,
    };
  }

  return {
    vertices,
    indices,
  };
}
