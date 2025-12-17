import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildDummyCode, travel } from './prepare-storybook-internal';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 해당 경로에서 스토리 파일을 찾는다.
 */
const demoPath = path.resolve(__dirname, '../pages');
const srcPath = path.resolve(__dirname, '../src');

/**
 * 스크립트 실행
 */
prepareStorybook();

/**
 * 스토리북을 위해 필요한 준비 작업을 수행하는 스크립트의 엔트리 포인트.
 *
 * - 데모 페이지의 소스보기를 위한 더미 코드 생성
 */
function prepareStorybook() {
  travel(demoPath, ({ currentPath, storyConfig }) => {
    buildDummyCode({ currentPath, storyConfig });
  });
  //   travel(srcPath, ({ currentPath, storyConfig }) => {
  //     // console.log(currentPath, storyConfig);
  //   });
}
