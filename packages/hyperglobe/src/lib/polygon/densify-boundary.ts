import type { Coordinate } from '../../types/coordinate';
import { toRadian } from '../math/to-radian';

/**
 * 두 경위도 좌표 사이의 구면 거리 계산 (Haversine formula)
 *
 * @param coord1 - 첫 번째 좌표 [경도, 위도]
 * @param coord2 - 두 번째 좌표 [경도, 위도]
 * @param radius - 구의 반지름
 * @returns 구면 거리
 */
function sphericalDistance(coord1: Coordinate, coord2: Coordinate, radius: number): number {
  const [lon1, lat1] = coord1.map(toRadian);
  const [lon2, lat2] = coord2.map(toRadian);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radius * c;
}

/**
 * 두 경위도 좌표 사이를 구면 보간 (Spherical Linear Interpolation)
 *
 * @param coord1 - 첫 번째 좌표 [경도, 위도]
 * @param coord2 - 두 번째 좌표 [경도, 위도]
 * @param t - 보간 비율 (0~1)
 * @returns 보간된 좌표
 */
function sphericalInterpolate(coord1: Coordinate, coord2: Coordinate, t: number): Coordinate {
  const [lon1, lat1] = coord1.map(toRadian);
  const [lon2, lat2] = coord2.map(toRadian);

  // Convert to 3D Cartesian coordinates
  const x1 = Math.cos(lat1) * Math.cos(lon1);
  const y1 = Math.cos(lat1) * Math.sin(lon1);
  const z1 = Math.sin(lat1);

  const x2 = Math.cos(lat2) * Math.cos(lon2);
  const y2 = Math.cos(lat2) * Math.sin(lon2);
  const z2 = Math.sin(lat2);

  // Spherical interpolation
  const dot = x1 * x2 + y1 * y2 + z1 * z2;
  const theta = Math.acos(Math.max(-1, Math.min(1, dot)));

  if (theta < 0.001) {
    // Points are very close, use linear interpolation
    return [coord1[0] + (coord2[0] - coord1[0]) * t, coord1[1] + (coord2[1] - coord1[1]) * t];
  }

  const sinTheta = Math.sin(theta);
  const a = Math.sin((1 - t) * theta) / sinTheta;
  const b = Math.sin(t * theta) / sinTheta;

  const x = a * x1 + b * x2;
  const y = a * y1 + b * y2;
  const z = a * z1 + b * z2;

  // Convert back to lat/lon
  const lat = Math.asin(Math.max(-1, Math.min(1, z)));
  const lon = Math.atan2(y, x);

  return [lon * (180 / Math.PI), lat * (180 / Math.PI)];
}

/**
 * 다각형 경계에 점을 추가하여 밀집도를 높임
 * 큰 삼각형 생성을 방지하여 면이 찢어지는 현상 해결
 *
 * @param coordinates - 원본 다각형 좌표 배열
 * @param maxEdgeLength - 허용되는 최대 변 길이 (구면 거리)
 * @param radius - 구의 반지름
 * @returns 밀집화된 좌표 배열
 *
 * @example
 * ```ts
 * const original = [[0, 0], [10, 0], [10, 10], [0, 10]];
 * const densified = densifyBoundary(original, 0.1, 1.0);
 * // 각 변이 0.1보다 길면 중간에 점들이 추가됨
 * ```
 */
export function densifyBoundary(
  coordinates: Coordinate[],
  maxEdgeLength: number,
  radius: number = 1.0
): Coordinate[] {
  if (coordinates.length < 2) {
    return [...coordinates];
  }

  const densified: Coordinate[] = [];

  for (let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];
    const next = coordinates[(i + 1) % coordinates.length];

    densified.push(current);

    // 현재 변의 길이 계산
    const edgeLength = sphericalDistance(current, next, radius);

    // 필요한 세분화 횟수 계산
    const numSegments = Math.ceil(edgeLength / maxEdgeLength);

    // 중간 점들 추가
    if (numSegments > 1) {
      for (let j = 1; j < numSegments; j++) {
        const t = j / numSegments;
        const interpolated = sphericalInterpolate(current, next, t);
        densified.push(interpolated);
      }
    }
  }

  return densified;
}

/**
 * 다각형 면적 기반으로 적절한 maxEdgeLength 추정
 *
 * @param coordinates - 다각형 좌표 배열
 * @param radius - 구의 반지름
 * @param targetTriangles - 목표 삼각형 개수 (선택)
 * @returns 권장 maxEdgeLength
 */
export function estimateMaxEdgeLength(
  coordinates: Coordinate[],
  radius: number,
  targetTriangles: number = 100
): number {
  if (coordinates.length < 3) {
    return 0.1;
  }

  // 경계 상자 계산으로 대략적인 크기 파악
  let minLon = Infinity,
    maxLon = -Infinity;
  let minLat = Infinity,
    maxLat = -Infinity;

  for (const [lon, lat] of coordinates) {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  // 대략적인 너비와 높이 (구면 거리)
  const width = sphericalDistance(
    [minLon, (minLat + maxLat) / 2],
    [maxLon, (minLat + maxLat) / 2],
    radius
  );
  const height = sphericalDistance(
    [(minLon + maxLon) / 2, minLat],
    [(minLon + maxLon) / 2, maxLat],
    radius
  );

  const approximateArea = width * height;

  // 정삼각형 기준으로 변의 길이 추정
  const triangleArea = approximateArea / targetTriangles;
  const edgeLength = Math.sqrt((4 * triangleArea) / Math.sqrt(3));

  return Math.max(0.01, Math.min(0.5, edgeLength));
}
