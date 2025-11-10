import { Coordinate } from '@hyperglobe/interfaces';

export function isPointInPolygon(point: [number, number], polygon: Coordinate[]): boolean {
  // Ray casting 알고리즘
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!;
    const pj = polygon[j]!;

    const xi = pi[0];
    const yi = pi[1];
    const xj = pj[0];
    const yj = pj[1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}
