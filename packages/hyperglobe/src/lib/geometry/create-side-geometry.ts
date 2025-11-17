import * as THREE from 'three';
import type { BorderlineSource } from '@hyperglobe/interfaces';

export interface CreateSideGeometryOptions {
  /**
   * 외곽선 정보
   */
  borderLines: BorderlineSource;

  /**
   * 측면의 높이 (extrusion depth)
   *
   * - 폴리곤이 구 표면에서 얼마나 떠있는지를 나타냅니다.
   * - 기본값: 0.001
   */
  extrusionDepth?: number;
}

/**
 * 외곽선 좌표를 기반으로 측면(side wall) geometry를 생성합니다.
 *
 * **작동 원리:**
 * 1. borderLines의 각 선분마다 사각형(2개의 삼각형)을 생성
 * 2. 위쪽 정점: 현재 높이 (폴리곤이 떠있는 위치)
 * 3. 아래쪽 정점: 구 표면 방향으로 extrusionDepth만큼 내린 위치
 *
 * **최적화:**
 * - 모든 측면을 하나의 BufferGeometry로 병합
 * - 드로우콜 1회로 모든 측면 렌더링
 *
 * @example
 * ```typescript
 * const sideGeometry = createSideGeometry({
 *   borderLines: feature.borderLines,
 *   extrusionDepth: 0.001
 * });
 * ```
 */
export function createSideGeometry({
  borderLines,
  extrusionDepth = 0.001,
}: CreateSideGeometryOptions): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  let vertexIndex = 0;

  // 각 외곽선 배열을 순회. 3차원 좌표 벡터 배열이고, 각 벡터는 [x, y, z] 형태로 저장되어 있음. 그래서 길이가 항상 3의 배수임
  for (const pointArray of borderLines.pointArrays) {
    // 외곽선의 점들을 순회하며 측면 생성
    for (let i = 0; i < pointArray.length; i += 3) {
      // 현재 점
      const x1 = pointArray[i];
      const y1 = pointArray[i + 1];
      const z1 = pointArray[i + 2];

      // 다음 점. 3차원 벡터니까 3칸 건너 뛰어야 다음 벡터임.
      const nextIndex = (i + 3) % pointArray.length; // 마지막 점이면 첫 점으로 루프. 모듈로 연산을 통해, 마지막 점 다음은 0, 1, 2가 된다.
      const x2 = pointArray[nextIndex];
      const y2 = pointArray[nextIndex + 1];
      const z2 = pointArray[nextIndex + 2];

      // 현재 벡터의 방향벡터를 구한다.
      // 원점에서 해당 좌표로 향하는 방향벡터를 알아야 구 표면 방향으로 내릴 수 있다.
      // 방향만 알면 벡터 길이를 조절해서 원하는 위치를 구할 수 있다.
      // ---------------------------------------------------------------
      // length = 벡터의 길이(크기) = √(x² + y² + z²)
      // 벡터길이를 구하는 이유는 단순히 방향벡터를 얻기 위해서이다.
      const length1 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);
      // 벡터의 각 성분을 길이로 나누면 길이가 1인 벡터가 된다. 이렇게 해서 방향벡터를 구한다(단위 벡터라고도 함.)
      const nx1 = x1 / length1;
      const ny1 = y1 / length1;
      const nz1 = z1 / length1;

      // 두 번째 점의 방향 벡터 (정규화)
      const length2 = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);
      const nx2 = x2 / length2;
      const ny2 = y2 / length2;
      const nz2 = z2 / length2;

      // 아래쪽 정점 (구 표면 방향으로 내림)
      // 원래 벡터길이에서 extrusionDepth만큼 뺀 길이로 새로운 점 계산
      const bottomRadius1 = length1 - extrusionDepth;
      const bx1 = nx1 * bottomRadius1;
      const by1 = ny1 * bottomRadius1;
      const bz1 = nz1 * bottomRadius1;

      const bottomRadius2 = length2 - extrusionDepth;
      const bx2 = nx2 * bottomRadius2;
      const by2 = ny2 * bottomRadius2;
      const bz2 = nz2 * bottomRadius2;

      // 4개의 정점으로 사각형 생성
      // v0: 첫 점 위
      vertices.push(x1, y1, z1);
      // v1: 첫 점 아래
      vertices.push(bx1, by1, bz1);
      // v2: 다음 점 위
      vertices.push(x2, y2, z2);
      // v3: 다음 점 아래
      vertices.push(bx2, by2, bz2);

      // 첫 번째 삼각형 (v0, v1, v2)
      indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
      // 두 번째 삼각형 (v1, v3, v2)
      indices.push(vertexIndex + 1, vertexIndex + 3, vertexIndex + 2);

      vertexIndex += 4;
    }
  }

  // BufferGeometry 생성
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}
