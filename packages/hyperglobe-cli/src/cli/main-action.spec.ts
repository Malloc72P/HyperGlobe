import { isExistFile } from '../lib/is-exist-file.js';
import { mainAction, MainActionOption } from './main-action.js';
import { resolve } from 'path';

// jest.mock('../lib/is-exist-file.js', () => ({
//   isExistFile: jest.fn(),
// }));

describe('mainAction', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('input과 output 경로를 resolve 해야 함', () => {});
});
