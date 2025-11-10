import { BoundingBox, RegionBBox, RegionModel } from '@hyperglobe/interfaces';

export interface ToRegionBBoxOptions {
  region: RegionModel;
  bbox: BoundingBox;
}

export function toRegionBBox({ region, bbox }: ToRegionBBoxOptions): RegionBBox {
  return {
    ...bbox,
    region,
  };
}
