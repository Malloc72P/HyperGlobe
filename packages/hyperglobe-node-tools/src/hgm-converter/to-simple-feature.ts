import { SimpleFeature } from '@hyperglobe/interfaces';
import { toFeaturePolygons } from './to-polygon';
import { getBoundingBox } from '@hyperglobe/tools';

/**
 * GeoJSON 피쳐를 SimpleFeature 객체로 변환합니다.
 * 폴리곤을 다루기 쉽게 하기 위해 단순화된 형태로 변환합니다.
 */
export function toSimpleFeature(feature: any) {
  const simpleFeature: SimpleFeature = {
    id: feature.id,
    type: feature.type,
    properties: feature.properties,
    polygons: toFeaturePolygons(feature),
    bbox: getBoundingBox(feature),
  };

  return simpleFeature;
}
