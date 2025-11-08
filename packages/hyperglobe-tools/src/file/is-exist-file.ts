import { existsSync, readFileSync } from 'fs';

export function isExistFile(filePath: string): boolean {
  return existsSync(filePath);
}
