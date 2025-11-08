import { readFileSync } from 'fs';

export function loadGeoJson(inputPath: string) {
  try {
    const rawFile = readFileSync(inputPath, 'utf-8');

    return JSON.parse(rawFile);
  } catch (error) {
    throw new Error(
      `GeoJson 파일을 로드하지 못했습니다. 파일이 존재하지 않거나 올바른 형식이 아닙니다. (${inputPath})`
    );
  }
}
