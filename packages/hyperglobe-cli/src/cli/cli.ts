import { Command } from 'commander';
import { MainConstants } from '../constants/main-constants';
import { mainAction } from './main-action';

export function createCommander() {
  const { name, description, version } = MainConstants;
  const program = new Command();

  program
    .name(name)
    .description(description)
    .version(version)
    .requiredOption(
      '-i, --input <file>',
      '입력 파일 (필수). ex: ./a.geo.json 경로를 지정하지 않는 경우, 현재 디렉토리에서 찾음'
    )
    .option(
      '-o, --output <file>',
      '출력 파일 (미지정시 현재 디렉토리 밑에 생성. ex: ./a.geo.json -> ./map.hgm)',
      './'
    )
    .action((options) => {
      mainAction(options);
    });

  return program;
}
