import { BoundingBox } from './coordinate';
import { FeaturePolygons } from './polygon';

export interface RegionModel<DATA_TYPE = any> extends BoundingBox {
  id: string;
  name: string;
  bboxSize: number;
  polygons: FeaturePolygons[];
  data?: DATA_TYPE;
  properties: Record<string, any>;
}
