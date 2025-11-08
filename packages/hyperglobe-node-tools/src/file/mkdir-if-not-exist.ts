import { existsSync, rmSync, mkdirSync } from 'fs';

export function mkdirIfNotExist(path: string) {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
  mkdirSync(path, { recursive: true });
}
