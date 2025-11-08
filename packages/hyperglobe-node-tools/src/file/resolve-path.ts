import { resolve } from 'path';
import { cwd } from 'process';

export function resolvePath(path: string): string {
  return resolve(cwd(), path);
}
