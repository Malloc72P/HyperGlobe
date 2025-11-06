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
  properties: Record<string, any>;

  // 메쉬 (삼각분할 완료된 상태)
  mesh: {
    vertices: Float32Array; // [x,y,z, ...]
    indices: Uint32Array; // [0,1,2, ...]
  };

  // 외곽선 (이미 구체에 투영됨)
  borderlines: {
    positions: Float32Array; // [x1,y1,z1, x2,y2,z2, ...]
  };
}
