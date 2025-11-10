import { RegionModel } from './region';

/**
 * ### 경위도 좌표.
 *
 * - 첫 번째 요소는 경도(longitude)를 나타내며, -180도에서 180도 사이의 값을 가집니다.
 * - 두 번째 요소는 위도(latitude)를 나타내며, -90도에서 90도 사이의 값을 가집니다.
 */
export type Coordinate = [number, number];

/**
 * ### 3차원 벡터 좌표.
 *
 * - 첫 번째 요소는 x 좌표를 나타냅니다.
 * - 두 번째 요소는 y 좌표를 나타냅니다.
 * - 세 번째 요소는 z 좌표를 나타냅니다.
 */
export type VectorCoordinate = [number, number, number];

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface RegionBBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  region: RegionModel;
}
