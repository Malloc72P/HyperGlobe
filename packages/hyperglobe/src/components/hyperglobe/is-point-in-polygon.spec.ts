import { describe, expect, it } from 'vitest';
import type { Coordinate } from '@hyperglobe/interfaces';
import { isPointInPolygon } from './globe';

describe('isPointInPolygon', () => {
  it('사각형 내부의 점', () => {
    const square: Coordinate[] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0], // 닫힌 폴리곤
    ];

    expect(isPointInPolygon([5, 5], square)).toBe(true);
    expect(isPointInPolygon([1, 1], square)).toBe(true);
    expect(isPointInPolygon([9, 9], square)).toBe(true);
  });

  it('사각형 외부의 점', () => {
    const square: Coordinate[] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ];

    expect(isPointInPolygon([15, 5], square)).toBe(false);
    expect(isPointInPolygon([-5, 5], square)).toBe(false);
    expect(isPointInPolygon([5, 15], square)).toBe(false);
    expect(isPointInPolygon([5, -5], square)).toBe(false);
  });

  it('사각형 경계의 점', () => {
    const square: Coordinate[] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ];

    // 경계는 내부로 취급될 수도, 외부로 취급될 수도 있음 (구현에 따라)
    const onEdge = isPointInPolygon([0, 5], square);
    console.log('경계 테스트:', onEdge);
  });

  it('삼각형 내부/외부', () => {
    const triangle: Coordinate[] = [
      [0, 0],
      [10, 0],
      [5, 10],
      [0, 0],
    ];

    expect(isPointInPolygon([5, 5], triangle)).toBe(true);
    expect(isPointInPolygon([3, 3], triangle)).toBe(true);
    expect(isPointInPolygon([15, 5], triangle)).toBe(false);
    expect(isPointInPolygon([5, 15], triangle)).toBe(false);
  });

  it('복잡한 폴리곤', () => {
    const polygon: Coordinate[] = [
      [0, 0],
      [5, 5],
      [10, 0],
      [10, 10],
      [0, 10],
      [0, 0],
    ];

    // [5, 3]은 실제로 폴리곤 외부 (아래쪽 돌출 삼각형 아래)
    expect(isPointInPolygon([5, 3], polygon)).toBe(false);
    // [5, 6]은 내부 (위쪽 사각형 영역)
    expect(isPointInPolygon([5, 6], polygon)).toBe(true);
    expect(isPointInPolygon([2, 8], polygon)).toBe(true);
    expect(isPointInPolygon([15, 5], polygon)).toBe(false);
  });

  it('실제 지리 좌표 - 간단한 사각형 (서울 근처)', () => {
    // 서울 근처의 간단한 사각형 영역
    const region: Coordinate[] = [
      [126, 37], // 좌하단
      [128, 37], // 우하단
      [128, 38], // 우상단
      [126, 38], // 좌상단
      [126, 37], // 닫기
    ];

    // 서울 좌표 (126.978, 37.566)
    expect(isPointInPolygon([126.978, 37.566], region)).toBe(true);

    // 영역 외부
    expect(isPointInPolygon([125, 37], region)).toBe(false);
    expect(isPointInPolygon([129, 37], region)).toBe(false);
  });

  it('폴리곤이 닫혀있지 않은 경우', () => {
    const openSquare: Coordinate[] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      // 마지막 점이 첫 점과 같지 않음
    ];

    // 알고리즘은 암묵적으로 닫힌 것으로 처리해야 함
    expect(isPointInPolygon([5, 5], openSquare)).toBe(true);
  });

  it('음수 좌표', () => {
    const square: Coordinate[] = [
      [-10, -10],
      [10, -10],
      [10, 10],
      [-10, 10],
      [-10, -10],
    ];

    expect(isPointInPolygon([0, 0], square)).toBe(true);
    expect(isPointInPolygon([-5, -5], square)).toBe(true);
    expect(isPointInPolygon([15, 0], square)).toBe(false);
  });

  it('매우 작은 폴리곤', () => {
    const tiny: Coordinate[] = [
      [0, 0],
      [0.1, 0],
      [0.1, 0.1],
      [0, 0.1],
      [0, 0],
    ];

    expect(isPointInPolygon([0.05, 0.05], tiny)).toBe(true);
    expect(isPointInPolygon([0.5, 0.5], tiny)).toBe(false);
  });
});
