import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 해당 경로에서 스토리 파일을 찾는다.
 */
const demoPath = path.resolve(__dirname, '../pages');
const srcPath = path.resolve(__dirname, '../src');

/** 스토리 파일 확장자. 이 확장자를 가진 파일을 스토리로 간주한다. */
const storyExtension = '.stories.tsx';

const regex = /DUMMY\s*=\s*(true|false)/;

prepareStorybook();

/**
 * 스토리북을 위해 필요한 준비 작업을 수행합니다.
 *
 * - 데모 페이지의 소스보기를 위한 더미 코드 생성
 */
function prepareStorybook() {
  travel(demoPath, ({ currentPath, storyConfig }) => {
    console.log(currentPath, storyConfig);
  });
  travel(srcPath, ({ currentPath, storyConfig }) => {
    console.log(currentPath, storyConfig);
  });
}

async function travel(currentPath, callback) {
  const stat = fs.statSync(currentPath);
  const isDir = stat.isDirectory();

  if (!isDir) {
    /**
     * 파일 이름이 스토리 확장자와 일치하는지 확인
     */
    if (isStoryFile(currentPath)) {
      const fileText = fs.readFileSync(currentPath, 'utf-8');
      const storyConfig = fileText.match(regex);
      const generateDummyEnabled = Boolean(storyConfig[1]);

      if (generateDummyEnabled) {
        callback && callback({ currentPath, storyConfig });
      }
    }

    return;
  }

  const files = fs.readdirSync(currentPath);

  for (const file of files) {
    await travel(path.join(currentPath, file), callback);
  }
}

function isStoryFile(filePath) {
  return filePath.endsWith(storyExtension);
}
