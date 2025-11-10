import { RawHGMFeature, SimpleFeature } from '@hyperglobe/interfaces';
import { toBorderlineSource } from './to-borderline-source';
import { toGeometrySource } from './to-geometry-source';

export function toHgmFeature(feature: SimpleFeature): RawHGMFeature {
  const hgmFeatures: RawHGMFeature = {
    id: feature.id,
    // properties
    p: feature.properties,
    // geometrySource
    g: toGeometrySource(feature.polygons),
    // borderlineSource
    l: toBorderlineSource(feature.polygons),
    // bounding box
    b: feature.bbox,
  };

  return hgmFeatures;
}
