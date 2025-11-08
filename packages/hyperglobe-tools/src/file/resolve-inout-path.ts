import { isExistFile } from './is-exist-file';
import { resolvePath } from './resolve-path';

export interface resolveInOutPathsOption {
  input: string;
  output: string;
}

export function resolveInOutPaths(options: resolveInOutPathsOption) {
  const { input, output } = options;

  // 입출력 경로 처리.
  const resolvedInput = resolvePath(input);
  const resolvedOutput = resolvePath(output);

  const isExist = isExistFile(resolvedInput);

  // 입력 파일 존재 여부 확인. 없으면 에러 처리.
  if (!isExist) {
    console.error(`입력 파일을 찾을 수 없습니다: ${resolvedInput}`);
    process.exit(1);
  }

  return {
    input: resolvedInput,
    output: resolvedOutput,
  };
}
