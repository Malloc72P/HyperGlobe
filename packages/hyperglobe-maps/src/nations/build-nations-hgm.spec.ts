import { describe, it, expect } from 'vitest';
import { buildNationsHGM } from './build-nations-hgm';
import { MapMeta } from '../meta';

describe('buildNationsHGM', () => {
  // 테스트용 초저해상도 메타데이터 (빠른 실행을 위해)
  const testMeta: MapMeta = {
    defaultResolution: {
      simplifyPercent: 50, // 기본값보다 더 많이 간소화
    },
    resolutions: [
      {
        resolution: 'test-ultra-low',
        simplifyPercent: 2, // 매우 강력한 간소화 (빠른 테스트)
        precision: 0.001,
      },
    ],
  };

  it('실제 SHP 파일을 사용하여 HGM 파일을 성공적으로 생성해야 함', async () => {
    const result = await buildNationsHGM({ meta: testMeta });
    const hgm = result[0];
    const feature = hgm?.features[0];

    expect(feature?.id).toBeTruthy();
    // property 검증
    expect(feature?.p).toBeTruthy();
    expect(feature?.p?.id).toBeTruthy();
    // geometrySource 검증
    expect(feature?.g).toBeTruthy();
    // borderlineSource 검증
    expect(feature?.l).toBeTruthy();
    // boundingBox 검증
    expect(feature?.b).toBeTruthy();
  }, 30000);
});
