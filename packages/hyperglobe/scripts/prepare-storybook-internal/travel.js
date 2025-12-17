import fs from 'fs';
import path from 'path';
import { isStoryFile } from './is-story-file.js';

/** 스토리 파일에서 DUMMY 설정을 찾기 위한 정규식 */
const regex = /DUMMY\s*=\s*(true|false)/;

/**
 * 지정한 경로에서 재귀적으로 파일과 디렉토리를 탐색하며 콜백을 실행
 *
 * 스토리 파일을 찾고, DUMMY 설정이 true로 되어 있는 경우에만 콜백을 호출한다.
 *
 * @param {string} currentPath
 * @param {(arg: { currentPath: string, storyConfig: string }) => void} callback
 * @returns
 */
export async function travel(currentPath, callback) {
  const stat = fs.statSync(currentPath);
  const isDir = stat.isDirectory();

  if (!isDir) {
    /**
     * 파일 이름이 스토리 확장자와 일치하는지 확인
     */
    if (isStoryFile(currentPath)) {
      const fileText = fs.readFileSync(currentPath, 'utf-8');
      const storyConfig = fileText.match(regex);
      const generateDummyEnabled = storyConfig && Boolean(storyConfig[1]);

      if (generateDummyEnabled) {
        callback && callback({ currentPath, storyConfig: fileText });
      }
    }

    return;
  }

  const files = fs.readdirSync(currentPath);

  for (const file of files) {
    await travel(path.join(currentPath, file), callback);
  }
}
