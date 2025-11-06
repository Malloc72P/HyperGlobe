import { readFileSync } from 'fs';
import { loadGeoJson } from './load-geojson';
import { HGMFile } from '@hyperglobe/interfaces';
import { toFeaturePolygons } from './to-polygon';

export interface ConvertOption {
  inputPath: string;
}

export function convert({ inputPath }: ConvertOption) {
  const hgmData: HGMFile = {
    features: [],
  };

  const geoJson = loadGeoJson(inputPath);

  const featurePolygons = geoJson.features.map((f: any) => toFeaturePolygons(f));
}
