import { describe, it, expect } from 'vitest';
import { sphericalEarcut } from './spherical-earcut';
import type { VectorCoordinate } from '../../types/coordinate';
import { OrthographicProj } from '../projections/orthographic';

describe('sphericalEarcut', () => {
  it('삼각형 하나를 올바르게 처리해야 함', () => {
    const vertices: VectorCoordinate[] = [
      [1, 0, 0],
      [0, 0, 1],
      [-1, 0, 0],
    ];

    const indices = sphericalEarcut(vertices);

    expect(indices).toEqual([0, 1, 2]);
  });

  it('사각형을 두 개의 삼각형으로 분할해야 함', () => {
    // 경위도로 사각형 정의
    const coords: [number, number][] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];

    // 3D 좌표로 변환
    const vertices = OrthographicProj.projects(coords, 1);
    const indices = sphericalEarcut(vertices);

    // 4개 정점으로 2개의 삼각형 = 6개의 인덱스
    expect(indices.length).toBe(6);

    // 모든 인덱스가 유효한 범위 내에 있어야 함
    for (const idx of indices) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(4);
    }
  });

  it('5각형을 올바르게 삼각분할해야 함', () => {
    // 경위도로 5각형 정의
    const coords: [number, number][] = [
      [0, 0],
      [10, 0],
      [12, 8],
      [5, 12],
      [-5, 8],
    ];

    const vertices = OrthographicProj.projects(coords, 1);
    const indices = sphericalEarcut(vertices);

    // 5개 정점으로 3개의 삼각형 = 9개의 인덱스
    expect(indices.length).toBe(9);

    // 모든 인덱스가 유효한 범위 내에 있어야 함
    for (const idx of indices) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(5);
    }
  });

  it('빈 배열에 대해 빈 인덱스를 반환해야 함', () => {
    const vertices: VectorCoordinate[] = [];
    const indices = sphericalEarcut(vertices);

    expect(indices).toEqual([]);
  });

  it('점이 2개 이하면 빈 인덱스를 반환해야 함', () => {
    const vertices: VectorCoordinate[] = [
      [1, 0, 0],
      [0, 1, 0],
    ];
    const indices = sphericalEarcut(vertices);

    expect(indices).toEqual([]);
  });
});
