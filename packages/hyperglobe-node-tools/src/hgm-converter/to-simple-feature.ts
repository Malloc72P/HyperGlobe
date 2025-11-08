import { SimpleFeature } from '@hyperglobe/interfaces';
import { toFeaturePolygons } from './to-polygon';

export function toSimpleFeature(feature: any) {
  const simpleFeature: SimpleFeature = {
    id: feature.id,
    type: feature.type,
    properties: feature.properties,
    polygons: toFeaturePolygons(feature),
  };

  return simpleFeature;
}
