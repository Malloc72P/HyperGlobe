import type { Coordinate, VectorCoordinate } from '../../types/coordinate';

/**
 * 2D 벡터의 크기(magnitude) 계산
 */
export function magnitude2D(v: Coordinate): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

/**
 * 3D 벡터의 크기(magnitude) 계산
 */
export function magnitude3D(v: VectorCoordinate): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

/**
 * 두 2D 점 사이의 유클리드 거리 계산
 */
export function distance2D(p1: Coordinate, p2: Coordinate): number {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
}
