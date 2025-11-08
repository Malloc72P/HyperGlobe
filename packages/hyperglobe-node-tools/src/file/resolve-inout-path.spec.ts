import { resolve } from 'path';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { resolveInOutPaths } from './resolve-inout-path';

describe('resolveInOutPaths', () => {
  it('input과 output 경로를 resolve 해야 함', () => {
    // 현재 디렉토리 기준 상대 경로 설정
    const geoJsonPath = resolve(__dirname, '../../dummy/world-low.geo.json');
    const outputPath = resolve(__dirname, './output.hgm');

    const options = {
      input: geoJsonPath,
      output: outputPath,
    };

    const { input: resolvedInput, output: resolvedOutput } = resolveInOutPaths(options);
    expect(resolvedInput).toBe(geoJsonPath);
    expect(resolvedOutput).toBe(outputPath);
  });
});
