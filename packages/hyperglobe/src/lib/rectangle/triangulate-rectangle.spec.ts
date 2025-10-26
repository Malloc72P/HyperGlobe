import { describe, expect, it } from 'vitest';
import type { VectorCoordinate } from '../../types/coordinate';
import { triangulateRectangle } from './triangulate-rectangle';

describe('triangulateRectangle', () => {
  it('subdivisions=1일 때 6개의 인덱스를 생성해야 함 (삼각형 2개)', () => {
    // Given: 4개의 그리드 포인트 (2x2)
    const gridPoints: VectorCoordinate[] = [
      [0, 1, 0], // topLeft
      [1, 1, 0], // topRight
      [0, 0, 0], // bottomLeft
      [1, 0, 0], // bottomRight
    ];

    // When
    const indices = triangulateRectangle({
      gridPoints,
      subdivisions: 1,
    });

    // Then: 삼각형 2개 = 인덱스 6개
    expect(indices).toHaveLength(6);
  });

  it('subdivisions=2일 때 24개의 인덱스를 생성해야 함 (삼각형 8개)', () => {
    // Given: 9개의 그리드 포인트 (3x3)
    const gridPoints: VectorCoordinate[] = Array.from({ length: 9 }, (_, i) => [
      i % 3,
      Math.floor(i / 3),
      0,
    ]);

    // When
    const indices = triangulateRectangle({
      gridPoints,
      subdivisions: 2,
    });

    // Then: 2x2 셀 = 4개 셀, 각 셀당 삼각형 2개 = 8개 삼각형 = 인덱스 24개
    expect(indices).toHaveLength(24);
  });

  it('생성된 인덱스는 모두 유효한 범위 내에 있어야 함', () => {
    // Given
    const gridPoints: VectorCoordinate[] = Array.from({ length: 9 }, (_, i) => [
      i % 3,
      Math.floor(i / 3),
      0,
    ]);

    // When
    const indices = triangulateRectangle({
      gridPoints,
      subdivisions: 2,
    });

    // Then: 모든 인덱스는 0 이상, gridPoints.length 미만
    indices.forEach((index) => {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(gridPoints.length);
    });
  });

  it('각 셀은 정확히 2개의 삼각형으로 구성되어야 함', () => {
    // Given
    const subdivisions = 1;
    const gridPoints: VectorCoordinate[] = [
      [0, 1, 0],
      [1, 1, 0],
      [0, 0, 0],
      [1, 0, 0],
    ];

    // When
    const indices = triangulateRectangle({
      gridPoints,
      subdivisions,
    });

    // Then: 삼각형 2개 = 6개 인덱스 (각 삼각형 3개)
    expect(indices).toHaveLength(6);

    // 첫 번째 삼각형: topLeft, bottomLeft, topRight
    expect(indices.slice(0, 3)).toEqual([0, 2, 1]);

    // 두 번째 삼각형: topRight, bottomLeft, bottomRight
    expect(indices.slice(3, 6)).toEqual([1, 2, 3]);
  });

  it('인덱스는 3개씩 묶여야 함 (삼각형 단위)', () => {
    // Given
    const gridPoints: VectorCoordinate[] = Array.from({ length: 9 }, (_, i) => [
      i % 3,
      Math.floor(i / 3),
      0,
    ]);

    // When
    const indices = triangulateRectangle({
      gridPoints,
      subdivisions: 2,
    });

    // Then: 인덱스 개수는 3의 배수여야 함
    expect(indices.length % 3).toBe(0);
  });

  it('subdivisions=10일 때 600개의 인덱스를 생성해야 함', () => {
    // Given: 실제 사용될 subdivisions 값 (121개 포인트)
    const gridPoints: VectorCoordinate[] = Array.from({ length: 121 }, (_, i) => [
      i % 11,
      Math.floor(i / 11),
      0,
    ]);

    // When
    const indices = triangulateRectangle({
      gridPoints,
      subdivisions: 10,
    });

    // Then: 10x10 셀 = 100개 셀, 각 셀당 삼각형 2개 = 200개 삼각형 = 600개 인덱스
    expect(indices).toHaveLength(600);
  });

  it('삼각형의 와인딩 순서가 일관되어야 함', () => {
    // Given
    const gridPoints: VectorCoordinate[] = [
      [0, 1, 0], // 0: topLeft
      [1, 1, 0], // 1: topRight
      [0, 0, 0], // 2: bottomLeft
      [1, 0, 0], // 3: bottomRight
    ];

    // When
    const indices = triangulateRectangle({
      gridPoints,
      subdivisions: 1,
    });

    // Then: 각 삼각형의 와인딩 순서 확인
    // 첫 번째 삼각형: 반시계방향 또는 시계방향으로 일관되어야 함
    const tri1 = indices.slice(0, 3);
    const tri2 = indices.slice(3, 6);

    // 인덱스가 예상한 패턴을 따르는지 확인
    expect(tri1).toEqual([0, 2, 1]); // topLeft, bottomLeft, topRight
    expect(tri2).toEqual([1, 2, 3]); // topRight, bottomLeft, bottomRight
  });
});
