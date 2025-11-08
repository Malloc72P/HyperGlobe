import {
  cpSync,
  existsSync,
  mkdirSync,
  rm,
  rmdir,
  rmdirSync,
  rmSync,
  write,
  writeFileSync,
} from 'fs';
import { createNationsHGM } from './nations';
import { RawHGMFile } from '../../hyperglobe-interface/src';
import { dirname, join, resolve } from 'path';
import { compressHgmData, mkdirIfNotExist, formatBytesToMB } from '@hyperglobe/node-tools';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface MapInfo {
  name: string;
  size: number;
  mb: string;
}

export async function buildMaps() {
  const distPath = resolve(join(__dirname, '../dist'));
  const storybookPublicPath = resolve(join(__dirname, '../../hyperglobe/public/maps'));
  const rawHgmList: RawHGMFile[] = [...(await createNationsHGM())];
  const mapInfos: MapInfo[] = [];

  mkdirIfNotExist(distPath);
  mkdirIfNotExist(storybookPublicPath);

  for (const hgm of rawHgmList) {
    if (!hgm.metadata?.name) {
      throw new Error('지도데이터 이름이 누락되었습니다!');
    }

    const name = hgm.metadata?.name;
    const filename = `${name}.hgm`;
    const outputPath = resolve(join(distPath, filename));
    const buffer = compressHgmData(hgm);
    const byteSize = buffer.length;
    const mb = formatBytesToMB(byteSize);

    writeFileSync(outputPath, buffer);
    console.log(`지도데이터 생성 완료: ${outputPath}, ${mb} bytes`);

    mapInfos.push({
      name,
      size: buffer.length,
      mb: formatBytesToMB(buffer.length),
    });
  }

  writeFileSync(
    resolve(join(distPath, 'index.ts')),
    `export const mapsInfo = ${JSON.stringify(mapInfos, null, 2)} as const;`,
    'utf-8'
  );

  cpSync(distPath, storybookPublicPath, { recursive: true });
}
