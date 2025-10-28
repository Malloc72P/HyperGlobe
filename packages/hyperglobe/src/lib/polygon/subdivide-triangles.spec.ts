import { describe, expect, it } from 'vitest';
import { subdivideTriangles } from './subdivide-triangles';
import type { VectorCoordinate } from '../../types/coordinate';

describe('subdivideTriangles', () => {
  it('should return original triangle when no subdivision needed', () => {
    // 아주 작은 삼각형 (세분화가 불필요한 크기)
    const vertices: VectorCoordinate[] = [
      [1, 0, 0],
      [0.99, 0.01, 0],
      [0.99, 0, 0.01],
    ];
    const indices = [0, 1, 2];
    const radius = 1;

    const result = subdivideTriangles(vertices, indices, radius, {
      maxDepth: 2,
      maxTriangleArea: 1, // 큰 값으로 설정하여 세분화 방지
      maxEdgeLength: 1, // 큰 값으로 설정하여 세분화 방지
    });

    // 삼각형 개수가 동일해야 함 (세분화 안됨)
    expect(result.indices.length).toBe(3);
  });

  it('should subdivide large triangles', () => {
    // 큰 삼각형 (세분화가 필요한 크기)
    const vertices: VectorCoordinate[] = [
      [1, 0, 0], // 적도, 0도
      [0, 1, 0], // 적도, 90도
      [0, 0, 1], // 북극
    ];
    const indices = [0, 1, 2];
    const radius = 1;

    const result = subdivideTriangles(vertices, indices, radius, {
      maxDepth: 1,
      maxTriangleArea: 0.1, // 작은 값으로 설정하여 세분화 유도
      maxEdgeLength: 0.5, // 작은 값으로 설정하여 세분화 유도
    });

    // 세분화된 후에는 더 많은 삼각형이 있어야 함
    expect(result.indices.length).toBeGreaterThan(3);

    // 4배로 늘어나야 함 (1개 -> 4개)
    expect(result.indices.length).toBe(12); // 4 삼각형 × 3 인덱스

    // 새로운 꼭짓점이 추가되어야 함
    expect(result.vertices.length).toBeGreaterThan(3);
  });

  it('should respect maxDepth limit', () => {
    // 큰 삼각형이지만 maxDepth=0으로 제한
    const vertices: VectorCoordinate[] = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    const indices = [0, 1, 2];
    const radius = 1;

    const result = subdivideTriangles(vertices, indices, radius, {
      maxDepth: 0, // 세분화 금지
      maxTriangleArea: 0.001,
      maxEdgeLength: 0.001,
    });

    // maxDepth=0이므로 세분화가 안되어야 함
    expect(result.indices.length).toBe(3);
    expect(result.vertices.length).toBe(3);
  });

  it('should maintain vertex coordinates on sphere surface', () => {
    const vertices: VectorCoordinate[] = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    const indices = [0, 1, 2];
    const radius = 1.5; // 반지름 1.5

    const result = subdivideTriangles(vertices, indices, radius, {
      maxDepth: 1,
      maxTriangleArea: 0.1,
    });

    // 모든 꼭짓점이 구면 위에 있는지 확인 (반지름 허용 오차 내)
    for (const vertex of result.vertices) {
      const distance = Math.sqrt(vertex[0] ** 2 + vertex[1] ** 2 + vertex[2] ** 2);
      expect(distance).toBeCloseTo(radius, 5);
    }
  });

  it('should work with multiple triangles', () => {
    // 2개의 삼각형
    const vertices: VectorCoordinate[] = [
      [1, 0, 0], // 0
      [0, 1, 0], // 1
      [0, 0, 1], // 2
      [-1, 0, 0], // 3
    ];
    const indices = [0, 1, 2, 1, 3, 2]; // 2개의 삼각형
    const radius = 1;

    const result = subdivideTriangles(vertices, indices, radius, {
      maxDepth: 1,
      maxTriangleArea: 0.1,
    });

    // 2개 삼각형이 각각 4개씩 나뉘어 8개가 되어야 함
    expect(result.indices.length).toBe(24); // 8 삼각형 × 3 인덱스
  });
});
