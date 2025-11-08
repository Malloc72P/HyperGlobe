// @ts-ignore
import mapshaper from 'mapshaper'; // 얘는 dts 없음.

export interface SimplifyOptions {
  simplifyPercent?: number; // 몇 퍼센트로 simplify할지 설정하는 옵션값
  precision?: number;
}

/**
 * simplify 알고리즘을 적용하여 지도 해상도를 낮춰 용량을 줄이는 함수.
 *
 * 기존 geojson을 변경하지 않는다. 새 객체를 생성함.
 *
 * https://github.com/mbloch/mapshaper/wiki/Command-Reference#-simplify
 *
 * @param geoJsonData simplify할 geoJson 데이터
 * @param options simplify 옵션
 * @returns simplify된 geoJson 데이터
 */
export async function simplify(geoJsonData: object, options: SimplifyOptions): Promise<any> {
  const input = { inputData: geoJsonData };

  /**
   * simplify 알고리즘: weighted Visvalingam.
   */
  const cmd = `-i inputData -simplify weighted ${options.simplifyPercent}% keep-shapes -o precision=${options.precision} outputFile.geojson`;

  try {
    const result = await mapshaper.applyCommands(cmd, input);
    const buffer = result['outputFile.geojson'] as Buffer;

    return JSON.parse(buffer.toString());
  } catch (error) {
    console.error(error);
    throw error;
  }
}
