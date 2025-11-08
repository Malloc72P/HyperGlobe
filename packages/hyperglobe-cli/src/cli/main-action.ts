import { writeFileSync } from 'fs';
import { CliOption } from '../types/cli-option';
import { gzipSync } from 'zlib';
import {
  resolveInOutPaths,
  convertGeojsonToHgm,
  loadGeoJson,
  compressHgmData,
} from '@hyperglobe/node-tools';

export interface MainActionOption extends CliOption {}

export function mainAction(options: MainActionOption) {
  const { input, output } = resolveInOutPaths(options);
  const geojson = loadGeoJson(input);

  const hgmData = convertGeojsonToHgm({ geojson });

  // 결과를 파일로 저장
  writeFileSync(output, compressHgmData(hgmData));
}
