import { describe, expect, it } from 'vitest';
import { OrthographicProj } from '../projections/orthographic';
import type { Coordinate } from '../../types/coordinate';
import { createGridPoints } from './create-grid-points';
import { magnitude3D } from '../math/magnitude';

describe('createGridPoints', () => {
  it('subdivisions=1일 때 4개의 그리드 포인트를 생성해야 함', () => {
    // Given: 경위도 좌표 (작은 사각형 영역)
    const coords: [Coordinate, Coordinate, Coordinate, Coordinate] = [
      [0, 10], // 좌상단
      [10, 10], // 우상단
      [10, 0], // 우하단
      [0, 0], // 좌하단
    ];
    const fillRadius = 1;
    const corners = OrthographicProj.projects(coords, fillRadius);

    // When
    const result = createGridPoints({
      leftTop: corners[0],
      rightTop: corners[1],
      rightBottom: corners[2],
      leftBottom: corners[3],
      subdivisions: 1,
      fillRadius,
    });

    // Then: (subdivisions + 1)^2 = (1 + 1)^2 = 4개
    expect(result).toHaveLength(4);
  });

  it('subdivisions=2일 때 9개의 그리드 포인트를 생성해야 함', () => {
    // Given: 경위도 좌표
    const coords: [Coordinate, Coordinate, Coordinate, Coordinate] = [
      [-10, 20],
      [10, 20],
      [10, -20],
      [-10, -20],
    ];
    const fillRadius = 1;
    const corners = OrthographicProj.projects(coords, fillRadius);

    // When
    const result = createGridPoints({
      leftTop: corners[0],
      rightTop: corners[1],
      rightBottom: corners[2],
      leftBottom: corners[3],
      subdivisions: 2,
      fillRadius,
    });

    // Then: (subdivisions + 1)^2 = (2 + 1)^2 = 9개
    expect(result).toHaveLength(9);
  });

  it('생성된 모든 포인트는 3D 좌표여야 함 (x, y, z)', () => {
    // Given: 경위도 좌표
    const coords: [Coordinate, Coordinate, Coordinate, Coordinate] = [
      [0, 30],
      [30, 30],
      [30, -30],
      [0, -30],
    ];
    const fillRadius = 1;
    const corners = OrthographicProj.projects(coords, fillRadius);

    // When
    const result = createGridPoints({
      leftTop: corners[0],
      rightTop: corners[1],
      rightBottom: corners[2],
      leftBottom: corners[3],
      subdivisions: 2,
      fillRadius,
    });

    // Then: 모든 포인트가 [x, y, z] 형태이고 유효한 숫자여야 함
    result.forEach((point) => {
      expect(point).toHaveLength(3);
      expect(typeof point[0]).toBe('number');
      expect(typeof point[1]).toBe('number');
      expect(typeof point[2]).toBe('number');
      // NaN이 없어야 함
      expect(Number.isNaN(point[0])).toBe(false);
      expect(Number.isNaN(point[1])).toBe(false);
      expect(Number.isNaN(point[2])).toBe(false);
    });
  });

  it('subdivisions=10일 때 121개의 포인트를 생성해야 함', () => {
    // Given: 실제 사용될 경위도 좌표와 subdivisions 값
    const coords: [Coordinate, Coordinate, Coordinate, Coordinate] = [
      [-20, 40],
      [20, 40],
      [20, -40],
      [-20, -40],
    ];
    const fillRadius = 1;
    const corners = OrthographicProj.projects(coords, fillRadius);

    // When
    const result = createGridPoints({
      leftTop: corners[0],
      rightTop: corners[1],
      rightBottom: corners[2],
      leftBottom: corners[3],
      subdivisions: 10,
      fillRadius,
    });

    // Then: (10 + 1)^2 = 121개
    expect(result).toHaveLength(121);
  });

  it('생성된 모든 포인트는 구면 위에 있어야 함', () => {
    // Given: 경위도 좌표
    const coords: [Coordinate, Coordinate, Coordinate, Coordinate] = [
      [-15, 25],
      [15, 25],
      [15, -25],
      [-15, -25],
    ];
    const fillRadius = 1.005;
    const corners = OrthographicProj.projects(coords, fillRadius);

    // When
    const result = createGridPoints({
      leftTop: corners[0],
      rightTop: corners[1],
      rightBottom: corners[2],
      leftBottom: corners[3],
      subdivisions: 5,
      fillRadius,
    });

    // Then: 모든 포인트가 구 표면에 있어야 함 (반지름이 fillRadius와 가까워야 함)
    result.forEach((point) => {
      const distance = magnitude3D(point);
      expect(distance).toBeCloseTo(fillRadius, 3);
    });
  });
});
