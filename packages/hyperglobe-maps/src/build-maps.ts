import { cpSync, existsSync, mkdirSync, rm, rmdir, rmdirSync, rmSync, writeFileSync } from 'fs';
import { createNationsHGM } from './nations';
import { RawHGMFile } from '../../hyperglobe-interface/src';
import { dirname, join, resolve } from 'path';
import { compressHgmData, mkdirIfNotExist } from '@hyperglobe/node-tools';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function buildMaps() {
  const distPath = resolve(join(__dirname, '../dist'));
  const storybookPublicPath = resolve(join(__dirname, '../../hyperglobe/public/maps'));
  const rawHgmList: RawHGMFile[] = [...(await createNationsHGM())];

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

    writeFileSync(outputPath, buffer);
    console.log(`지도데이터 생성 완료: ${outputPath}`);
  }

  cpSync(distPath, storybookPublicPath, { recursive: true });
}
