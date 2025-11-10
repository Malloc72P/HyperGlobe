import { BoundingBox } from './coordinate';
import {
  BorderlineSource,
  GeometrySource,
  RawBorderlineSource,
  RawGeometrySource,
} from './polygon';

export interface HGM {
  version?: string;
  metadata?: {
    name?: string;
    featureCount?: number;
    triangleCount?: number;
  };
  features: HGMFeature[];
}

export interface HGMFeature {
  id: string;
  // 속성 정보
  properties: Record<string, any>;
  // 지오메트리 생성을 위한 정보
  geometries: GeometrySource[];
  // 외곽선 정보
  borderLines: BorderlineSource;
  // bbox
  bbox: BoundingBox;
}

export interface RawHGMFile {
  version?: string;
  metadata?: {
    name?: string;
    featureCount?: number;
    triangleCount?: number;
  };
  features: RawHGMFeature[];
}

export interface RawHGMFeature {
  id: string;
  // 속성 정보
  p: Record<string, any>;
  // 지오메트리 생성을 위한 정보
  g: RawGeometrySource[];
  // 외곽선 정보
  l: RawBorderlineSource;
  // bbox
  b: BoundingBox;
}
