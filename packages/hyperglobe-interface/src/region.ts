import { BoundingBox } from './coordinate';

export interface RegionModel extends BoundingBox {
  id: string;
  name: string;
}
