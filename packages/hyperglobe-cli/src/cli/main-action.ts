import { writeFileSync } from 'fs';
import { CliOption } from '../types/cli-option';
import { gzipSync } from 'zlib';
import { resolveInOutPaths, convertGeojsonToHgm, loadGeoJson } from '@hyperglobe/tools';

export interface MainActionOption extends CliOption {}

export function mainAction(options: MainActionOption) {
  const { input, output } = resolveInOutPaths(options);
  const geojson = loadGeoJson(input);

  const hgmData = convertGeojsonToHgm({ geojson });

  // 결과를 파일로 저장
  writeFileSync(output, gzipSync(JSON.stringify(hgmData)));
}
