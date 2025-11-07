import { join, resolve } from 'path';
import { describe, it } from 'vitest';
import { mainAction } from './main-action';

describe('main-action', () => {
  it('world-low', () => {
    const inputPath = resolve(join(__dirname, '/../../dummy/world-low.geo.json'));
    const outputPath = resolve(join(__dirname, '/../../dummy/world-low.hgm'));

    mainAction({ input: inputPath, output: outputPath });
  });

  it('world-mid', () => {
    const inputPath = resolve(join(__dirname, '/../../dummy/world-mid.geo.json'));
    const outputPath = resolve(join(__dirname, '/../../dummy/world-mid.hgm'));

    mainAction({ input: inputPath, output: outputPath });
  });

  it('world-high', () => {
    const inputPath = resolve(join(__dirname, '/../../dummy/world-high.geo.json'));
    const outputPath = resolve(join(__dirname, '/../../dummy/world-high.hgm'));

    mainAction({ input: inputPath, output: outputPath });
  });
});
