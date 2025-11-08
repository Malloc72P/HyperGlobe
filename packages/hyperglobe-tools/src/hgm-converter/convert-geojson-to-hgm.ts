import { RawHGMFile } from '@hyperglobe/interfaces';
import { toHgmFeature } from './to-hgm-feature';
import { toSimpleFeature } from './to-simple-feature';

export interface ConvertOption {
  geojson: any;
}

export function convertGeojsonToHgm({ geojson }: ConvertOption) {
  // 처리하기 쉽게 단순화된 객체로 변환
  const hgmFeatures = geojson.features.map(toSimpleFeature).map(toHgmFeature);

  // HGM 포맷 객체 생성
  const hgmData: RawHGMFile = {
    features: hgmFeatures,
  };

  return hgmData;
}
