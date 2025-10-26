import { describe, expect, it } from 'vitest';
import type { Coordinate } from '../../types/coordinate';
import { triangulatePolygon } from './triangulate-polygon';

describe('triangulatePolygon', () => {
  it('삼각형 폴리곤은 1개의 삼각형을 생성해야 함', () => {
    // Given: 삼각형 좌표
    const coordinates: Coordinate[] = [
      [0, 0],
      [10, 0],
      [5, 10],
    ];
    const radius = 1;

    // When
    const result = triangulatePolygon({ coordinates, radius });

    // Then: 삼각형 1개 = 인덱스 3개
    expect(result.indices).toHaveLength(3);
    expect(result.indices).toEqual([1, 2, 0]);
    expect(result.vertices).toHaveLength(3);
  });

  it('사각형 폴리곤은 2개의 삼각형을 생성해야 함', () => {
    // Given: 사각형 좌표
    const coordinates: Coordinate[] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];
    const radius = 1;

    // When
    const result = triangulatePolygon({ coordinates, radius });

    // Then: 삼각형 2개 = 인덱스 6개
    expect(result.indices).toHaveLength(6);
    expect(result.vertices).toHaveLength(4);
  });

  it('복잡한 폴리곤도 올바르게 삼각분할해야 함', () => {
    // Given: 5각형
    const coordinates: Coordinate[] = [
      [0, 0],
      [10, 0],
      [12, 5],
      [5, 10],
      [-2, 5],
    ];
    const radius = 1;

    // When
    const result = triangulatePolygon({ coordinates, radius });

    // Then: 5각형 = 삼각형 3개 = 인덱스 9개
    expect(result.indices).toHaveLength(9);
    expect(result.vertices).toHaveLength(5);
  });

  it('생성된 모든 3D 좌표는 유효한 숫자여야 함', () => {
    // Given
    const coordinates: Coordinate[] = [
      [-10, 20],
      [10, 20],
      [10, -20],
      [-10, -20],
    ];
    const radius = 1.005;

    // When
    const result = triangulatePolygon({ coordinates, radius });

    // Then: 모든 좌표가 [x, y, z] 형태이고 NaN이 없어야 함
    result.vertices.forEach((vertex) => {
      expect(vertex).toHaveLength(3);
      expect(Number.isNaN(vertex[0])).toBe(false);
      expect(Number.isNaN(vertex[1])).toBe(false);
      expect(Number.isNaN(vertex[2])).toBe(false);
    });
  });

  it('생성된 모든 3D 좌표는 구면 위에 있어야 함', () => {
    // Given
    const coordinates: Coordinate[] = [
      [0, 30],
      [30, 30],
      [30, -30],
      [0, -30],
    ];
    const radius = 1.005;

    // When
    const result = triangulatePolygon({ coordinates, radius });

    // Then: 모든 점이 구 표면에 있어야 함
    result.vertices.forEach((vertex) => {
      const distance = Math.sqrt(vertex[0] ** 2 + vertex[1] ** 2 + vertex[2] ** 2);
      expect(distance).toBeCloseTo(radius, 3);
    });
  });

  it('인덱스는 유효한 범위 내에 있어야 함', () => {
    // Given
    const coordinates: Coordinate[] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];
    const radius = 1;

    // When
    const result = triangulatePolygon({ coordinates, radius });

    // Then: 모든 인덱스가 vertices 범위 내에 있어야 함
    const maxIndex = result.vertices.length - 1;
    result.indices.forEach((index) => {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThanOrEqual(maxIndex);
    });
  });

  it('인덱스는 항상 3의 배수여야 함 (삼각형 단위)', () => {
    // Given: 다양한 폴리곤
    const testCases: Coordinate[][] = [
      // 삼각형
      [
        [0, 0],
        [10, 0],
        [5, 10],
      ],
      // 사각형
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
      // 육각형
      [
        [0, 0],
        [10, 0],
        [15, 5],
        [10, 10],
        [0, 10],
        [-5, 5],
      ],
    ];

    testCases.forEach((coordinates) => {
      // When
      const result = triangulatePolygon({ coordinates, radius: 1 });

      // Then: 인덱스 개수는 항상 3의 배수
      expect(result.indices.length % 3).toBe(0);
    });
  });
});
