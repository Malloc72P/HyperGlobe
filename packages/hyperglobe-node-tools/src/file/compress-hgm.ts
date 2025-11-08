import { RawHGMFile } from '@hyperglobe/interfaces';
import { gzipSync } from 'zlib';

export function compressHgmData(hgmData: RawHGMFile): Buffer {
  return gzipSync(JSON.stringify(hgmData));
}
