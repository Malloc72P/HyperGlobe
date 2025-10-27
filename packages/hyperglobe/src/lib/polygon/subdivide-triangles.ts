import type { VectorCoordinate } from '../../types/coordinate';
import { sphericalMidpoint, triangleArea } from '../math/spherical-interpolation';

export interface SubdivisionOptions {
  /**
   * 최대 세분화 깊이 (0 = 세분화 안함)
   */
  maxDepth?: number;

  /**
   * 삼각형 최대 면적 임계값
   * 이 값보다 큰 삼각형은 세분화됨
   */
  maxTriangleArea?: number;

  /**
   * 삼각형 최대 변의 길이 임계값
   * 이 값보다 긴 변을 가진 삼각형은 세분화됨
   */
  maxEdgeLength?: number;
}

export interface SubdivisionResult {
  vertices: VectorCoordinate[];
  indices: number[];
}

/**
 * 하나의 삼각형을 4개의 작은 삼각형으로 세분화
 *
 * 각 변의 중점을 구하여 다음과 같이 나눔:
 *     C
 *    / \
 *   /   \
 *  F-----E
 * / \   / \
 * A---D---B
 *
 * @param a 첫 번째 꼭짓점
 * @param b 두 번째 꼭짓점
 * @param c 세 번째 꼭짓점
 * @param radius 구의 반지름
 * @returns 4개의 작은 삼각형 좌표 배열 [[a,d,f], [d,b,e], [f,e,c], [d,e,f]]
 */
function subdivideTriangle(
  a: VectorCoordinate,
  b: VectorCoordinate,
  c: VectorCoordinate,
  radius: number
): VectorCoordinate[][] {
  // 각 변의 중점을 구면에서 계산
  const d = sphericalMidpoint(a, b, radius); // AB 중점
  const e = sphericalMidpoint(b, c, radius); // BC 중점
  const f = sphericalMidpoint(c, a, radius); // CA 중점

  // 4개의 작은 삼각형 반환
  return [
    [a, d, f], // 왼쪽 아래
    [d, b, e], // 오른쪽 아래
    [f, e, c], // 위쪽
    [d, e, f], // 가운데 (뒤집어진 삼각형)
  ];
}

/**
 * 삼각형이 세분화가 필요한지 판단
 *
 * @param a 첫 번째 꼭짓점
 * @param b 두 번째 꼭짓점
 * @param c 세 번째 꼭짓점
 * @param options 세분화 옵션
 * @returns 세분화가 필요하면 true
 */
function shouldSubdivide(
  a: VectorCoordinate,
  b: VectorCoordinate,
  c: VectorCoordinate,
  options: SubdivisionOptions
): boolean {
  // 면적 체크
  if (options.maxTriangleArea) {
    const area = triangleArea(a, b, c);
    if (area > options.maxTriangleArea) {
      return true;
    }
  }

  // 변의 길이 체크
  if (options.maxEdgeLength) {
    const edgeAB = Math.sqrt(
      Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2) + Math.pow(b[2] - a[2], 2)
    );
    const edgeBC = Math.sqrt(
      Math.pow(c[0] - b[0], 2) + Math.pow(c[1] - b[1], 2) + Math.pow(c[2] - b[2], 2)
    );
    const edgeCA = Math.sqrt(
      Math.pow(a[0] - c[0], 2) + Math.pow(a[1] - c[1], 2) + Math.pow(a[2] - c[2], 2)
    );

    if (
      edgeAB > options.maxEdgeLength ||
      edgeBC > options.maxEdgeLength ||
      edgeCA > options.maxEdgeLength
    ) {
      return true;
    }
  }

  return false;
}

/**
 * 재귀적으로 삼각형을 세분화하여 메시 데이터 생성
 *
 * @param vertices 원본 꼭짓점 배열
 * @param indices 원본 삼각형 인덱스 배열
 * @param radius 구의 반지름
 * @param options 세분화 옵션
 * @returns 세분화된 메시 데이터
 */
export function subdivideTriangles(
  vertices: VectorCoordinate[],
  indices: number[],
  radius: number,
  options: SubdivisionOptions = {}
): SubdivisionResult {
  const { maxDepth = 3, maxTriangleArea = 0.01, maxEdgeLength = 0.2 } = options;

  // 결과를 저장할 배열들
  let resultVertices: VectorCoordinate[] = [...vertices];
  let resultIndices: number[] = [];

  // 세분화할 삼각형들을 큐로 관리 (삼각형 + 깊이)
  interface TriangleWithDepth {
    triangle: [VectorCoordinate, VectorCoordinate, VectorCoordinate];
    depth: number;
  }

  const queue: TriangleWithDepth[] = [];

  // 초기 삼각형들을 큐에 추가
  for (let i = 0; i < indices.length; i += 3) {
    const a = vertices[indices[i]];
    const b = vertices[indices[i + 1]];
    const c = vertices[indices[i + 2]];

    queue.push({
      triangle: [a, b, c],
      depth: 0,
    });
  }

  // 큐가 빌 때까지 처리
  while (queue.length > 0) {
    const {
      triangle: [a, b, c],
      depth,
    } = queue.shift()!;

    // 세분화 조건 체크
    const needsSubdivision =
      depth < maxDepth && shouldSubdivide(a, b, c, { maxTriangleArea, maxEdgeLength });

    if (needsSubdivision) {
      // 세분화 수행
      const subTriangles = subdivideTriangle(a, b, c, radius);

      // 세분화된 삼각형들을 큐에 추가 (깊이 증가)
      for (const subTriangle of subTriangles) {
        queue.push({
          triangle: subTriangle as [VectorCoordinate, VectorCoordinate, VectorCoordinate],
          depth: depth + 1,
        });
      }
    } else {
      // 세분화하지 않음 - 결과에 추가

      // 꼭짓점들의 인덱스 찾거나 새로 추가
      const indexA = findOrAddVertex(resultVertices, a);
      const indexB = findOrAddVertex(resultVertices, b);
      const indexC = findOrAddVertex(resultVertices, c);

      resultIndices.push(indexA, indexB, indexC);
    }
  }

  return {
    vertices: resultVertices,
    indices: resultIndices,
  };
}

/**
 * 꼭짓점 배열에서 주어진 좌표와 일치하는 인덱스를 찾거나 새로 추가
 *
 * @param vertices 꼭짓점 배열
 * @param vertex 찾을 꼭짓점
 * @param tolerance 허용 오차 (기본값: 1e-10)
 * @returns 꼭짓점의 인덱스
 */
function findOrAddVertex(
  vertices: VectorCoordinate[],
  vertex: VectorCoordinate,
  tolerance = 1e-10
): number {
  // 기존 꼭짓점과 일치하는지 확인
  for (let i = 0; i < vertices.length; i++) {
    const existing = vertices[i];
    const dx = Math.abs(existing[0] - vertex[0]);
    const dy = Math.abs(existing[1] - vertex[1]);
    const dz = Math.abs(existing[2] - vertex[2]);

    if (dx < tolerance && dy < tolerance && dz < tolerance) {
      return i;
    }
  }

  // 새 꼭짓점 추가
  vertices.push(vertex);
  return vertices.length - 1;
}
