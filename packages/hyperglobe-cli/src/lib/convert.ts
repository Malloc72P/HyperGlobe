import { readFileSync } from 'fs';
import { loadGeoJson } from './load-geojson';
import { HGMFile } from '@hyperglobe/interfaces';

export interface ConvertOption {
  inputPath: string;
}

export function convert({ inputPath }: ConvertOption) {
  const hgmData: HGMFile = {
    version: '1.0.0',
    metadata: {
      name: 'Converted HGM',
      featureCount: 0,
      triangleCount: 0,
    },
    features: [],
  };

  const geoJson = loadGeoJson(inputPath);
}
