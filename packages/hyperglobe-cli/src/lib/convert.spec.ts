import { describe, it } from 'vitest';
import { convert } from './convert';
import { join, resolve } from 'path';

describe('convert', () => {
  it('디버거가 작동해야 한다', () => {
    convert({ inputPath: resolve(join(__dirname, '/../../dummy/world-low.geo.json')) });
  });
});
