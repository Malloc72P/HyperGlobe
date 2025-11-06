import { Command } from 'commander';
import { createCommander } from './cli.js';
import { mainAction } from './main-action.js';

// mainAction 모킹
jest.mock('../cli/main-action.js', () => ({
  mainAction: jest.fn(),
}));

describe('HyperGlobe CLI', () => {
  let program: Command;

  beforeEach(() => {
    // 매번 새로운 Command 인스턴스 생성
    program = createCommander();
    jest.clearAllMocks();
  });

  describe('옵션 파싱', () => {
    it('input과 output 옵션을 올바르게 파싱해야 함', () => {
      program.parse(['-i', 'input.json', '-o', 'output.hgm'], { from: 'user' });

      expect(mainAction).toHaveBeenCalledTimes(1);
      expect(mainAction).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'input.json',
          output: 'output.hgm',
        })
      );
    });

    it('긴 형식 옵션을 올바르게 파싱해야 함', () => {
      program.parse(['--input', 'world.geo.json', '--output', 'world.hgm'], {
        from: 'user',
      });

      expect(mainAction).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'world.geo.json',
          output: 'world.hgm',
        })
      );
    });

    it('output이 생략되면 기본값이 적용되여야 함', () => {
      program.parse(['-i', 'input.json'], { from: 'user' });

      expect(mainAction).toHaveBeenCalledWith({
        input: 'input.json',
        output: './',
      });
    });
  });

  describe('필수 옵션 검증', () => {
    it('input이 없으면 에러를 발생시켜야 함', () => {
      // exitOverride로 process.exit 대신 에러 던지기
      program.exitOverride();

      expect(() => {
        program.parse(['-o', 'output.hgm'], { from: 'user' });
      }).toThrow();

      expect(mainAction).not.toHaveBeenCalled();
    });

    it('옵션이 전혀 없으면 에러를 발생시켜야 함', () => {
      program.exitOverride();

      expect(() => {
        program.parse([], { from: 'user' });
      }).toThrow();

      expect(mainAction).not.toHaveBeenCalled();
    });
  });
});
