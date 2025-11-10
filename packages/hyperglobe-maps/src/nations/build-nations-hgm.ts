import {
  convertGeojsonToHgm,
  resolveProperty,
  shpToGeoJson,
  simplify,
} from '@hyperglobe/node-tools';
import { MapMeta } from '../meta';
import { RawHGMFile } from '../../../hyperglobe-interface/src';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getBoundingBox } from '../../../hyperglobe-tools/src';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function buildNationsHGM({ meta }: { meta: MapMeta }) {
  const shpPath = resolve(__dirname, './shp/ne_10m_admin_0_countries.shp');
  const dbfPath = resolve(__dirname, './shp/ne_10m_admin_0_countries.dbf');

  /**
   * SHP 파일을 GeoJSON으로 변환, simplify 적용
   *
   * - 원본 해상도가 너무 큰 관계로, defaultResolution.simplifyPercent만큼 simplify 적용
   */
  const originalGeoJson = await simplify(
    await shpToGeoJson(shpPath, dbfPath, { encoding: 'UTF-8' }),
    { simplifyPercent: meta.defaultResolution.simplifyPercent, precision: 0.0001 }
  );
  const hgmList: RawHGMFile[] = [];

  /**
   * 각 해상도별로 HGM 변환 및 리스트에 추가
   */
  for (const { resolution, simplifyPercent, precision } of meta.resolutions) {
    console.log(`[Nations] Simplify(${simplifyPercent}) 적용중...`);

    const simplifiedGeoJson = await simplify(originalGeoJson, { simplifyPercent, precision });
    console.log(`[Nations] Simplify(${simplifyPercent}) 완료!`);

    /**
     * GeoJSON 데이터 정리
     */
    prepareGeoJson(simplifiedGeoJson);

    const metadata = {
      name: `nations-${resolution}`,
      description: `국가별 경계 지도 (${resolution} 해상도)`,
      type: 'nations',
      resolution,
    };

    console.log(`[Nations] HGM 변환중...`);

    /**
     * HGM 변환
     */
    hgmList.push(
      convertGeojsonToHgm({
        geojson: simplifiedGeoJson,
        metadata,
      })
    );
    console.log(`[Nations] HGM 변환 완료!`);
  }

  return hgmList;
}

/**
 * geojson 데이터 정리
 *
 * - 불필요한 속성 제거
 * - 속성 이름 변경
 * - 피쳐 id속성 설정
 * @param geojson
 */
function prepareGeoJson(geojson: any) {
  geojson.features = geojson.features.map((feature: any) => {
    const { ISO_A3_EH, ISO_A2_EH, LABEL_X, LABEL_Y, NAME_KO, NAME_EN, CONTINENT, ADM0_A3 } =
      feature.properties;
    const id = resolveProperty(ADM0_A3);

    return {
      ...feature,
      id,
      properties: {
        id,
        name: resolveProperty(NAME_KO),
        nameEn: resolveProperty(NAME_EN),
        isoA2: resolveProperty(ISO_A2_EH),
        isoA3: resolveProperty(ISO_A3_EH),
        labelX: LABEL_X,
        labelY: LABEL_Y,
        continent: resolveProperty(CONTINENT),
      },
    };
  });
}
