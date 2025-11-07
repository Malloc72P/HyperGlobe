import { HGMFile } from '@hyperglobe/interfaces';
import { loadGeoJson } from './load-geojson';
import { toHgmFeature } from './to-hgm-feature';
import { toSimpleFeature } from './to-simple-feature';

export interface ConvertOption {
  inputPath: string;
}

export function convert({ inputPath }: ConvertOption) {
  // geojson 파일 로드
  const geoJson = loadGeoJson(inputPath);

  // 처리하기 쉽게 단순화된 객체로 변환
  const hgmFeatures = geoJson.features.map(toSimpleFeature).map(toHgmFeature);

  // HGM 포맷 객체 생성
  const hgmData: HGMFile = {
    features: hgmFeatures,
  };

  return hgmData;
}
