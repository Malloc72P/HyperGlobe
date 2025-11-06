import Delaunator from 'delaunator';
import type { Coordinate, VectorCoordinate } from '../../../../hyperglobe-interface/src/coordinate';
import { OrthographicProj } from '../projections/orthographic';
import { distance2D } from '../math/magnitude';

/**
 * 폴리곤의 경계 상자(Bounding Box) 계산
 */
function findBBox(points: Coordinate[]): {
  min: { x: number; y: number };
  max: { x: number; y: number };
} {
  const min = { x: Infinity, y: Infinity };
  const max = { x: -Infinity, y: -Infinity };

  for (const [x, y] of points) {
    if (x < min.x) min.x = x;
    if (x > max.x) max.x = x;
    if (y < min.y) min.y = y;
    if (y > max.y) max.y = y;
  }

  return { min, max };
}

/**
 * 점이 폴리곤 내부에 있는지 확인 (Ray-casting algorithm)
 */
function isInside(point: Coordinate, polygon: Coordinate[]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * 경계선을 densify (점들 사이에 보간점 추가)
 * simplify된 데이터에서 경계선이 너무 성글 때 유용
 */
function densifyBoundary(polygon: Coordinate[], maxSegmentLength: number): Coordinate[] {
  const densified: Coordinate[] = [];

  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];

    densified.push(current);

    const dist = distance2D(current, next);
    const numSegments = Math.ceil(dist / maxSegmentLength);

    // 중간 점들 추가
    if (numSegments > 1) {
      for (let j = 1; j < numSegments; j++) {
        const t = j / numSegments;
        const interpolated: Coordinate = [
          current[0] + (next[0] - current[0]) * t,
          current[1] + (next[1] - current[1]) * t,
        ];
        densified.push(interpolated);
      }
    }
  }

  return densified;
}

/**
 * 폴리곤 내부에 균등한 격자점 생성
 *
 * 이것이 핵심! 경계만이 아니라 내부에도 점을 추가해야
 * Delaunay 삼각분할이 균등한 삼각형을 만들 수 있습니다.
 */
function generateInnerPoints(
  polygon: Coordinate[],
  gridSpacing: number,
  densifyBoundaryPoints: boolean = true
): Coordinate[] {
  // 경계선 densify (simplify된 데이터 대응)
  const boundaryPoints = densifyBoundaryPoints
    ? densifyBoundary(polygon, gridSpacing * 0.5) // 격자 간격의 절반으로 경계 보간
    : polygon;

  const result: Coordinate[] = [...boundaryPoints]; // 경계 점들 포함
  const bbox = findBBox(polygon);

  // 경계 상자 내부를 균등한 격자로 채움
  for (let x = bbox.min.x + gridSpacing / 2; x < bbox.max.x; x += gridSpacing) {
    for (let y = bbox.min.y + gridSpacing / 2; y < bbox.max.y; y += gridSpacing) {
      const point: Coordinate = [x, y];
      if (isInside(point, polygon)) {
        result.push(point);
      }
    }
  }

  return result;
}

/**
 * 삼각형의 중심점이 폴리곤 내부에 있는지 확인하여
 * 폴리곤 외부의 삼각형 제거
 */
function filterOuterTriangles(
  delaunator: Delaunator<ArrayLike<number>>,
  polygon: Coordinate[]
): number[] {
  const filteredIndices: number[] = [];

  for (let i = 0; i < delaunator.triangles.length; i += 3) {
    const t0 = delaunator.triangles[i];
    const t1 = delaunator.triangles[i + 1];
    const t2 = delaunator.triangles[i + 2];

    // 삼각형의 세 꼭짓점
    const x0 = delaunator.coords[2 * t0];
    const y0 = delaunator.coords[2 * t0 + 1];
    const x1 = delaunator.coords[2 * t1];
    const y1 = delaunator.coords[2 * t1 + 1];
    const x2 = delaunator.coords[2 * t2];
    const y2 = delaunator.coords[2 * t2 + 1];

    // 삼각형의 중심점
    const centerX = (x0 + x1 + x2) / 3;
    const centerY = (y0 + y1 + y2) / 3;

    // 중심점이 폴리곤 내부에 있으면 포함
    if (isInside([centerX, centerY], polygon)) {
      filteredIndices.push(t0, t1, t2);
    }
  }

  return filteredIndices;
}

export interface DelaunayTriangulateOptions {
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
   * @default 5 (StackOverflow 예제에서 사용한 값)
   */
  gridSpacing: number;

  /**
   * 경계선 densification 활성화
   * simplify된 데이터에서 경계가 성글 때 유용
   *
   * @default true
   */
  densifyBoundary?: boolean;
}
export interface DelaunayTriangulateResult {
  /**
   * 3D 좌표 배열 (구면 위의 점들)
   */
  vertices: VectorCoordinate[];

  /**
   * 삼각형 인덱스 배열
   */
  indices: number[];
}

/**
 * Delaunay 삼각분할을 사용한 폴리곤 삼각분할
 *
 * StackOverflow 답변 기반:
 * https://stackoverflow.com/questions/54484537/polygon-triangulation-for-globe
 *
 * 핵심 개선사항:
 * 1. 폴리곤 내부에 균등한 격자점 생성
 * 2. Delaunay 삼각분할로 균등한 삼각형 생성
 * 3. 폴리곤 외부의 삼각형 제거
 * 4. 구면으로 변환
 *
 * @example
 * ```ts
 * const result = delaunayTriangulate({
 *   coordinates: [[0, 0], [10, 0], [10, 10], [0, 10]],
 *   radius: 1.005,
 *   gridSpacing: 2,  // 2도 간격으로 격자점 생성
 *   densifyBoundary: true  // 경계선 보간 활성화
 * });
 * ```
 */
export function delaunayTriangulate({
  coordinates,
  radius,
  gridSpacing,
  densifyBoundary: shouldDensify = true,
}: DelaunayTriangulateOptions): DelaunayTriangulateResult {
  // 1. 폴리곤 내부에 균등한 격자점 생성 (경계선 densify 포함)
  const allPoints = generateInnerPoints(coordinates, gridSpacing, shouldDensify);

  // 2. 2D 좌표를 flat array로 변환
  const flatCoords = allPoints.flatMap((coord) => [coord[0], coord[1]]);

  // 3. Delaunay 삼각분할 수행
  const delaunator = Delaunator.from(allPoints.map((coord) => [coord[0], coord[1]]));

  // 4. 폴리곤 외부의 삼각형 제거
  const filteredIndices = filterOuterTriangles(delaunator, coordinates);

  // 5. 경위도 좌표를 3D 구면 좌표로 변환
  const vertices = OrthographicProj.projects(allPoints, radius);

  return {
    vertices,
    indices: filteredIndices,
  };
}
