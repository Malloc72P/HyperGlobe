import { BorderlineSource, GeometrySource } from './polygon';

export interface HGMFile {
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
  p: Record<string, any>;
  // 지오메트리 생성을 위한 정보
  g: GeometrySource[];
  // 외곽선 정보
  b: BorderlineSource;
}
