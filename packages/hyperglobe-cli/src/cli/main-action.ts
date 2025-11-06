import { CliOption } from '../types/cli-option';
import { resolveInOutPaths } from '../lib/resolve-inout-path';

export interface MainActionOption extends CliOption {}

export function mainAction(options: MainActionOption) {
  const { input, output } = resolveInOutPaths(options);
}
