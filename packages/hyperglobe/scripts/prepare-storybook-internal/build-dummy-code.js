import fs from 'fs';
import path from 'path';

/** 데모 파일을 import하는 구문에서 경로를 추출하기 위한 정규식 */
const demoFromImportRegex =
  /import\s+(?:type\s+)?(?:\{[^}]*\}|\w+)\s+from\s+['"](?<path>[^'"]+\.demo)['"]/;

export function buildDummyCode({ currentPath, storyConfig }) {
  if (!storyConfig) {
    return;
  }

  const demoPath = demoFromImportRegex.exec(storyConfig)?.groups?.path;
  const resolvedDemoPath = path.resolve(currentPath, '../', demoPath + '.tsx');
  const dummyCodePath = path.resolve(currentPath, '../', demoPath + '.dummy.ts');
  const demoText = fs.readFileSync(resolvedDemoPath, 'utf-8');

  const dummyCode = `export const DUMMY_CODE = ${demoText}`;

  fs.writeFileSync(dummyCodePath, dummyCode, 'utf-8');
}
