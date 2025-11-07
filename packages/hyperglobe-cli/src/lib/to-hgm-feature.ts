import { HGMFeature, SimpleFeature } from '@hyperglobe/interfaces';
import { toGeometrySource } from './to-geometry-source';
import { toBorderlineSource } from './to-borderline-source';

export function toHgmFeature(feature: SimpleFeature): HGMFeature {
  const hgmFeatures: HGMFeature = {
    id: feature.id,
    // properties
    p: feature.properties,
    // geometrySource
    g: toGeometrySource(feature.polygons),
    // borderlineSource
    b: toBorderlineSource(feature.polygons),
  };

  return hgmFeatures;
}
