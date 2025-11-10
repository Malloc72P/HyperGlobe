import { BoundingBox } from './coordinate';
import { FeaturePolygons } from './polygon';

export interface RegionModel extends BoundingBox {
  id: string;
  name: string;
  bboxSize: number;
  polygons: FeaturePolygons[];
}
