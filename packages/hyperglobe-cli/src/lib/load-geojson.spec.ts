import { readFileSync } from 'fs';
import { loadGeoJson } from './load-geojson.js';

jest.mock('fs');

describe('loadGeoJson', () => {
  const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('유효한 GeoJSON 파일을 성공적으로 로드해야 함', () => {
    const mockGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [127.0, 37.5],
          },
          properties: {
            name: 'Seoul',
          },
        },
      ],
    };

    mockReadFileSync.mockReturnValue(JSON.stringify(mockGeoJson));

    const result = loadGeoJson('test.geojson');

    expect(mockReadFileSync).toHaveBeenCalledWith('test.geojson', 'utf-8');
    expect(result).toEqual(mockGeoJson);
  });

  it('실제 world-low.geo.json 파일을 로드할 수 있어야 함', () => {
    mockReadFileSync.mockImplementation((...args) =>
      jest.requireActual('fs').readFileSync(...args)
    );

    const result = loadGeoJson('dummy/world-low.geo.json');

    expect(result).toBeDefined();
    expect(result.type).toBe('FeatureCollection');
    expect(Array.isArray(result.features)).toBe(true);
    expect(result.features.length).toBeGreaterThan(0);
  });

  it('파일이 존재하지 않으면 에러를 던져야 함', () => {
    const errorMessage = 'ENOENT: no such file or directory';
    mockReadFileSync.mockImplementation(() => {
      throw new Error(errorMessage);
    });

    expect(() => loadGeoJson('non-existent.geojson')).toThrow(
      'GeoJson 파일을 로드하지 못했습니다. 파일이 존재하지 않거나 올바른 형식이 아닙니다. (non-existent.geojson)'
    );
  });

  it('올바르지 않은 JSON 형식이면 에러를 던져야 함', () => {
    mockReadFileSync.mockReturnValue('{ invalid json }');

    expect(() => loadGeoJson('invalid.json')).toThrow(
      'GeoJson 파일을 로드하지 못했습니다. 파일이 존재하지 않거나 올바른 형식이 아닙니다. (invalid.json)'
    );
  });

  it('빈 파일이면 에러를 던져야 함', () => {
    mockReadFileSync.mockReturnValue('');

    expect(() => loadGeoJson('empty.json')).toThrow(
      'GeoJson 파일을 로드하지 못했습니다. 파일이 존재하지 않거나 올바른 형식이 아닙니다. (empty.json)'
    );
  });

  it('파일 경로가 포함된 에러 메시지를 반환해야 함', () => {
    mockReadFileSync.mockImplementation(() => {
      throw new Error('File read error');
    });

    const testPath = '/custom/path/test.geojson';

    expect(() => loadGeoJson(testPath)).toThrow(testPath);
  });
});
