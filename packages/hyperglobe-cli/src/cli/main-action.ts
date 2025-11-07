import { writeFileSync } from 'fs';
import { convert } from '../lib/convert';
import { resolveInOutPaths } from '../lib/resolve-inout-path';
import { CliOption } from '../types/cli-option';
import { gzipSync } from 'zlib';

export interface MainActionOption extends CliOption {}

export function mainAction(options: MainActionOption) {
  const { input, output } = resolveInOutPaths(options);

  const hgmData = convert({ inputPath: input });

  // 결과를 파일로 저장
  writeFileSync(output, gzipSync(JSON.stringify(hgmData)));
}
