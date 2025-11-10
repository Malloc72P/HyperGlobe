import * as shapefile from 'shapefile';

/**
 * SHP 파일을 GeoJSON 형식으로 변환합니다.
 *
 * - Example
 * ```typescript
 * shpToGeoJson(shpPath, dbfPath, { encoding: 'UTF-8' })
 * ```
 *
 * @param filePath SHP 파일 경로
 * @param dbfPath DBF 파일 경로 (선택 사항)
 * @param option shapefile 옵션 (선택 사항)
 * @returns GeoJSON 객체
 */
export async function shpToGeoJson(
  filePath: string,
  dbfPath?: string,
  option?: shapefile.Options
): Promise<any> {
  const features: any[] = [];
  try {
    const source = await shapefile.open(filePath, dbfPath, option);
    let result = await source.read();

    while (!result.done) {
      features.push(result.value);
      result = await source.read();
    }

    return {
      type: 'FeatureCollection',
      name: 'data',
      features,
    };
  } catch (error) {
    console.error('Error reading shapefile:', error);
    return null;
  }
}
