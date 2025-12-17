/** 스토리 파일 확장자. 이 확장자를 가진 파일을 스토리로 간주한다. */
const storyExtension = '.stories.tsx';

export function isStoryFile(filePath) {
  return filePath.endsWith(storyExtension);
}
