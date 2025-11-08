import { describe, expect, it } from 'vitest';
import { convertGeojsonToHgm } from './convert-geojson-to-hgm';
import { join, resolve } from 'path';
import { base64ToFloat32Array, base64ToUInt32Array, loadGeoJson, toNumArray } from '../file';

describe('hgm convert', () => {
  it('변환기 테스트', () => {
    const inputPath = resolve(join(__dirname, '/../../dummy/world-low.geo.json'));
    const geojson = loadGeoJson(inputPath);

    const rawHgmData = convertGeojsonToHgm({ geojson });
    const rawFeature = rawHgmData.features[0]!;
    const vertices = toNumArray(base64ToFloat32Array(rawFeature.g[0]!.v));
    const indices = toNumArray(base64ToUInt32Array(rawFeature.g[0]!.i));
    const borderlinePoints = toNumArray(base64ToFloat32Array(rawFeature.b.p));

    expect(rawHgmData.features.length).toBeGreaterThan(0);
    expect(rawFeature.id).toBeDefined();
    expect(rawFeature.p).toBeTruthy();
    expect(vertices.length).toBeGreaterThan(0);
    expect(indices.length).toBeGreaterThan(0);
    expect(borderlinePoints.length).toBeGreaterThan(0);
  });
});
