import fs from 'fs';
import path from 'path';

// ESM 환경에서 __dirname 대체
const rootDir = process.cwd();

// src와 dest 지정
const srcDir = path.resolve(rootDir, './dist');
const npmDir = path.resolve(rootDir, './publish/.npm/dist');

fs.cpSync(srcDir, npmDir, { recursive: true, force: true });

console.log(`Copied files Completed`);
