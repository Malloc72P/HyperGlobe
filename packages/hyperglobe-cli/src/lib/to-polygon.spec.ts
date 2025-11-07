import { toFeaturePolygons } from './to-polygon.js';
import { describe, expect, it, vi, beforeEach } from 'vitest';

describe('toFeaturePolygons', () => {
  describe('Polygon 타입 처리', () => {
    it('단일 Polygon 피쳐를 FeaturePolygons로 변환해야 함', () => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [127.0, 37.5],
              [127.1, 37.5],
              [127.1, 37.6],
              [127.0, 37.6],
              [127.0, 37.5],
            ],
          ],
        },
        properties: {
          name: 'Test Polygon',
        },
      };

      const result = toFeaturePolygons(feature);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result?.length).toBe(1);
      expect(result?.[0]).toEqual([
        [127.0, 37.5],
        [127.1, 37.5],
        [127.1, 37.6],
        [127.0, 37.6],
        [127.0, 37.5],
      ]);
    });

    it('구멍(holes)이 있는 Polygon의 경우 첫 번째 경계선만 추출해야 함', () => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            // 외곽 경계선
            [
              [0, 0],
              [10, 0],
              [10, 10],
              [0, 10],
              [0, 0],
            ],
            // 구멍 (hole)
            [
              [2, 2],
              [8, 2],
              [8, 8],
              [2, 8],
              [2, 2],
            ],
          ],
        },
        properties: {},
      };

      const result = toFeaturePolygons(feature);

      expect(result).toBeDefined();
      expect(result?.length).toBe(1);
      // 구멍 정보는 무시하고 첫 번째 경계선만 포함
      expect(result?.[0]).toEqual([
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ]);
    });
  });

  describe('MultiPolygon 타입 처리', () => {
    it('MultiPolygon 피쳐를 여러 FeaturePolygons로 변환해야 함', () => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            // 첫 번째 폴리곤
            [
              [
                [100, 0],
                [101, 0],
                [101, 1],
                [100, 1],
                [100, 0],
              ],
            ],
            // 두 번째 폴리곤
            [
              [
                [200, 0],
                [201, 0],
                [201, 1],
                [200, 1],
                [200, 0],
              ],
            ],
          ],
        },
        properties: {
          name: 'Test MultiPolygon',
        },
      };

      const result = toFeaturePolygons(feature);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result?.length).toBe(2);
      expect(result?.[0]).toEqual([
        [100, 0],
        [101, 0],
        [101, 1],
        [100, 1],
        [100, 0],
      ]);
      expect(result?.[1]).toEqual([
        [200, 0],
        [201, 0],
        [201, 1],
        [200, 1],
        [200, 0],
      ]);
    });

    it('구멍이 있는 MultiPolygon의 경우 각 폴리곤의 첫 번째 경계선만 추출해야 함', () => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            // 첫 번째 폴리곤 (구멍 있음)
            [
              [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10],
                [0, 0],
              ],
              [
                [2, 2],
                [8, 2],
                [8, 8],
                [2, 8],
                [2, 2],
              ],
            ],
            // 두 번째 폴리곤 (구멍 없음)
            [
              [
                [20, 20],
                [30, 20],
                [30, 30],
                [20, 30],
                [20, 20],
              ],
            ],
          ],
        },
        properties: {},
      };

      const result = toFeaturePolygons(feature);

      expect(result).toBeDefined();
      expect(result?.length).toBe(2);
      // 각 폴리곤의 외곽 경계선만 포함
      expect(result?.[0]).toEqual([
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ]);
      expect(result?.[1]).toEqual([
        [20, 20],
        [30, 20],
        [30, 30],
        [20, 30],
        [20, 20],
      ]);
    });
  });

  describe('엣지 케이스', () => {
    it('좌표가 비어있는 피쳐는 undefined를 반환해야 함', () => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [],
        },
        properties: {},
      };

      const result = toFeaturePolygons(feature);

      expect(result).toBeUndefined();
    });

    it('빈 MultiPolygon도 undefined를 반환해야 함', () => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [],
        },
        properties: {},
      };

      const result = toFeaturePolygons(feature);

      expect(result).toBeUndefined();
    });

    it('복잡한 실제 GeoJSON MultiPolygon 데이터를 처리해야 함', () => {
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [102.0, 2.0],
                [103.0, 2.0],
                [103.0, 3.0],
                [102.0, 3.0],
                [102.0, 2.0],
              ],
            ],
            [
              [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0],
              ],
              [
                [100.2, 0.2],
                [100.8, 0.2],
                [100.8, 0.8],
                [100.2, 0.8],
                [100.2, 0.2],
              ],
            ],
          ],
        },
        properties: {
          name: 'Complex MultiPolygon',
        },
      };

      const result = toFeaturePolygons(feature);

      expect(result).toBeDefined();
      expect(result?.length).toBe(2);
      expect(result?.[0]?.length).toBe(5);
      expect(result?.[1]?.length).toBe(5);
    });
  });
});
