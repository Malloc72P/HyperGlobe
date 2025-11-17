/**
 * Storybook 스토리의 render 함수 내용을 code-snippets 파일로 동기화하는 스크립트
 *
 * 사용법:
 *   pnpm sync:snippets <stories-file-path>
 *
 * 예시:
 *   pnpm sync:snippets src/components/colorscale-bar/colorscale-bar.stories.tsx
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';

/**
 * render 함수의 본문을 추출합니다.
 */
function extractRenderContent(fileContent: string, storyName: string): string | null {
  // export const {StoryName}: Story = { ... render: (args) => { ... } ... } 패턴 찾기
  // 중첩된 중괄호를 처리하기 위해 수동으로 파싱
  const storyStartPattern = new RegExp(`export\\s+const\\s+${storyName}\\s*:\\s*Story\\s*=\\s*\\{`);

  const startMatch = fileContent.match(storyStartPattern);
  if (!startMatch) {
    return null;
  }

  const startIndex = startMatch.index! + startMatch[0].length;

  // render 함수 찾기
  const renderPattern = /render\s*:\s*\([^)]*\)\s*=>\s*\{/;
  const renderMatch = fileContent.slice(startIndex).match(renderPattern);

  if (!renderMatch || renderMatch.index === undefined) {
    return null;
  }

  const renderStartIndex = startIndex + renderMatch.index + renderMatch[0].length;

  // 중괄호 매칭으로 render 함수의 끝 찾기
  let braceCount = 1;
  let renderEndIndex = renderStartIndex;

  while (braceCount > 0 && renderEndIndex < fileContent.length) {
    const char = fileContent[renderEndIndex];
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    renderEndIndex++;
  }

  if (braceCount !== 0) {
    return null;
  }

  let content = fileContent.slice(renderStartIndex, renderEndIndex - 1).trim();

  // 주석 제거 및 정리
  content = content
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');

  // 변수명 정규화 (_cs -> colorscale)
  content = content.replace(/colorscale:\s*_cs/g, 'colorscale');
  content = content.replace(/_cs/g, 'colorscale');

  // {...args} 제거
  content = content.replace(/\{\s*\.\.\.args\s*\}/g, '');

  // 공백 여러 개를 하나로
  content = content.replace(/\s+colorScale=/g, ' colorScale=');

  // 불필요한 빈 줄 제거
  content = content
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join('\n');

  // 들여쓰기 정규화 (최소 들여쓰기를 0으로)
  const lines = content.split('\n');
  const minIndent = Math.min(
    ...lines
      .filter((line) => line.trim().length > 0)
      .map((line) => line.match(/^(\s*)/)?.[1].length || 0)
  );

  content = lines.map((line) => line.slice(minIndent)).join('\n');

  return content.trim();
}

/**
 * code-snippets 파일을 업데이트합니다.
 */
function updateSnippetsFile(snippetsPath: string, snippetName: string, content: string): void {
  let snippetsContent = readFileSync(snippetsPath, 'utf-8');

  // 기존 스니펫 찾기
  const snippetRegex = new RegExp(`export const ${snippetName} = \`[\\s\\S]*?\`;`, 'g');

  const newSnippet = `export const ${snippetName} = \`${content}\`;`;

  if (snippetRegex.test(snippetsContent)) {
    // 기존 스니펫 교체
    snippetsContent = snippetsContent.replace(snippetRegex, newSnippet);
  } else {
    // 새 스니펫 추가
    snippetsContent += `\n\n${newSnippet}`;
  }

  writeFileSync(snippetsPath, snippetsContent, 'utf-8');
}

/**
 * 메인 함수
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ 사용법: pnpm sync:snippets <stories-file-path>');
    process.exit(1);
  }

  const storiesPath = resolve(process.cwd(), args[0]);
  const dir = dirname(storiesPath);
  const fileName = basename(storiesPath, '.stories.tsx');
  const snippetsPath = resolve(dir, `${fileName}.code-snippets.ts`);

  console.log('📖 스토리 파일 읽는 중:', storiesPath);

  try {
    const storiesContent = readFileSync(storiesPath, 'utf-8');

    // Default 스토리의 render 내용 추출
    const renderContent = extractRenderContent(storiesContent, 'Default');

    if (!renderContent) {
      console.error('❌ Default 스토리의 render 함수를 찾을 수 없습니다.');
      process.exit(1);
    }

    console.log('✅ render 함수 내용 추출 완료');
    console.log('📝 코드 스니펫 업데이트 중:', snippetsPath);

    updateSnippetsFile(snippetsPath, 'defaultExample', renderContent);

    console.log('✅ 코드 스니펫 동기화 완료!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

main();
