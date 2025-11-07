import { join, resolve } from 'path';
import { describe, it } from 'vitest';
import { mainAction } from './main-action';

describe('main-action', () => {
  it('디버거가 작동해야 한다', () => {
    const inputPath = resolve(join(__dirname, '/../../dummy/world-low.geo.json'));
    const outputPath = resolve(join(__dirname, '/../../dummy/world-low.hgm'));

    mainAction({ input: inputPath, output: outputPath });
  });
});
