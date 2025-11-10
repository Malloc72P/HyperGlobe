import { bbox } from '@turf/bbox';

export function getBoundingBox(feature: GeoJSON.Feature) {
  const [minX, minY, maxX, maxY] = bbox(feature);

  return {
    minX,
    minY,
    maxX,
    maxY,
  };
}
