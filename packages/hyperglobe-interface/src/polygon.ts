import type { Coordinate } from './coordinate';

export type FeaturePolygons = Coordinate[];

/**
 * 단순화된 GeoJSON Feature 타입 정의
 *
 * - 표준 GeoJson타입 아님.
 * - 필요한 속성만 정의한 단순화된 타입임.
 */
export interface SimpleFeature {
  id: string;
  type: string;
  properties: any;
  polygons: FeaturePolygons[];
}

/**
 * 지오메트리 생성을 위한 정보
 *
 * - 지오메트리를 만드는데 필요한 데이터. three.js는 해당 데이터로 피쳐의 폴리곤을 그린다.
 * - triangulation 결과라고 생각하면 된다.
 */
export interface GeometrySource {
  // vertices
  v: number[];
  // indices
  i: number[];
}

/**
 * 외곽선 생성을 위한 정보
 */
export interface BorderlineSource {
  // positions
  p: number[];
}
