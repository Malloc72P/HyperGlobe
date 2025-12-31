import fs from 'fs';
import path from 'path';
import { prepareStorybook } from './prepare-storybook';

prepareBuild();

function prepareBuild() {
  /** 스토리북 준비 작업 수행 */
  prepareStorybook();

  /** 배포 폴더의 버전(package.json/version) 동기화 */
  prepareVersion('./publish/.npm');

  /** 빌드 폴더 제거 */
  clearDist();
  clearDist('./publish/.npm');
}

function prepareVersion(targetPath) {
  const rootDir = process.cwd();
  const publishPkgPath = path.resolve(rootDir, targetPath, 'package.json');
  const originPkgPath = path.resolve(rootDir, 'package.json');
  const originPKG = JSON.parse(fs.readFileSync(originPkgPath, 'utf-8'));
  const publishPKG = JSON.parse(fs.readFileSync(publishPkgPath, 'utf-8'));

  const version = originPKG.version;
  publishPKG.version = version;

  fs.writeFileSync(publishPkgPath, JSON.stringify(publishPKG, null, 4), 'utf-8');
}

function clearDist(dir = './') {
  const rootDir = process.cwd();
  const distpath = path.resolve(rootDir, dir, 'dist');

  if (fs.existsSync(distpath)) {
    fs.rmSync(distpath, { recursive: true, force: true });
  }
}
