import { describe, it, expect } from 'vitest';
import { toSimpleFeature } from './to-simple-feature';
import type { SimpleFeature } from '@hyperglobe/interfaces';

describe('toSimpleFeature', () => {
  describe('Polygon 타입 Feature 변환', () => {
    it('단일 Polygon Feature를 SimpleFeature로 변환해야 한다', () => {
      // Given: 단일 Polygon 타입의 GeoJSON Feature
      const polygonFeature = {
        id: 'test-polygon-1',
        type: 'Feature',
        properties: {
          name: 'Test Polygon',
          population: 1000,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [10, 0],
              [10, 10],
              [0, 10],
              [0, 0],
            ],
          ],
        },
      };

      // When: toSimpleFeature 함수 호출
      const result: SimpleFeature = toSimpleFeature(polygonFeature);

      // Then: SimpleFeature 형식으로 올바르게 변환
      expect(result.id).toBe('test-polygon-1');
      expect(result.type).toBe('Feature');
      expect(result.properties).toEqual({
        name: 'Test Polygon',
        population: 1000,
      });
      expect(result.polygons).toHaveLength(1);
      expect(result.polygons[0]).toEqual([
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ]);
    });

    it('구멍(hole)이 있는 Polygon의 경우 외곽선만 변환해야 한다', () => {
      // Given: 구멍이 있는 Polygon Feature
      const polygonWithHole = {
        id: 'polygon-with-hole',
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            // 외곽선
            [
              [0, 0],
              [20, 0],
              [20, 20],
              [0, 20],
              [0, 0],
            ],
            // 구멍
            [
              [5, 5],
              [15, 5],
              [15, 15],
              [5, 15],
              [5, 5],
            ],
          ],
        },
      };

      // When
      const result = toSimpleFeature(polygonWithHole);

      // Then: 첫 번째 경계선(외곽선)만 포함
      expect(result.polygons).toHaveLength(1);
      expect(result.polygons[0]).toEqual([
        [0, 0],
        [20, 0],
        [20, 20],
        [0, 20],
        [0, 0],
      ]);
    });
  });

  describe('MultiPolygon 타입 Feature 변환', () => {
    it('MultiPolygon Feature를 SimpleFeature로 변환해야 한다', () => {
      // Given: MultiPolygon 타입의 GeoJSON Feature
      const multiPolygonFeature = {
        id: 'test-multipolygon-1',
        type: 'Feature',
        properties: {
          name: 'Test MultiPolygon',
        },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            // 첫 번째 Polygon
            [
              [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10],
                [0, 0],
              ],
            ],
            // 두 번째 Polygon
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
      };

      // When
      const result = toSimpleFeature(multiPolygonFeature);

      // Then
      expect(result.id).toBe('test-multipolygon-1');
      expect(result.type).toBe('Feature');
      expect(result.properties.name).toBe('Test MultiPolygon');
      expect(result.polygons).toHaveLength(2);
      expect(result.polygons[0]).toEqual([
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ]);
      expect(result.polygons[1]).toEqual([
        [20, 20],
        [30, 20],
        [30, 30],
        [20, 30],
        [20, 20],
      ]);
    });

    it('각 Polygon에 구멍이 있는 MultiPolygon의 경우 각 외곽선만 변환해야 한다', () => {
      // Given
      const multiPolygonWithHoles = {
        id: 'multipolygon-with-holes',
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            // 첫 번째 Polygon (구멍 포함)
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
            // 두 번째 Polygon (구멍 없음)
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
      };

      // When
      const result = toSimpleFeature(multiPolygonWithHoles);

      // Then: 각 Polygon의 외곽선만 포함
      expect(result.polygons).toHaveLength(2);
      expect(result.polygons[0]).toEqual([
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
        [0, 0],
      ]);
      expect(result.polygons[1]).toEqual([
        [20, 20],
        [30, 20],
        [30, 30],
        [20, 30],
        [20, 20],
      ]);
    });
  });

  describe('엣지 케이스', () => {
    it('빈 coordinates를 가진 Polygon Feature를 처리해야 한다', () => {
      // Given
      const emptyPolygon = {
        id: 'empty-polygon',
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [],
        },
      };

      // When
      const result = toSimpleFeature(emptyPolygon);

      // Then
      expect(result.id).toBe('empty-polygon');
      expect(result.polygons).toEqual([]);
    });

    it('빈 coordinates를 가진 MultiPolygon Feature를 처리해야 한다', () => {
      // Given
      const emptyMultiPolygon = {
        id: 'empty-multipolygon',
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiPolygon',
          coordinates: [],
        },
      };

      // When
      const result = toSimpleFeature(emptyMultiPolygon);

      // Then
      expect(result.id).toBe('empty-multipolygon');
      expect(result.polygons).toEqual([]);
    });

    it('properties가 null이거나 undefined인 경우를 처리해야 한다', () => {
      // Given
      const featureWithoutProps = {
        id: 'no-props',
        type: 'Feature',
        properties: null,
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [5, 0],
              [5, 5],
              [0, 5],
              [0, 0],
            ],
          ],
        },
      };

      // When
      const result = toSimpleFeature(featureWithoutProps);

      // Then
      expect(result.properties).toBeNull();
      expect(result.polygons).toHaveLength(1);
    });

    it('복잡한 properties 객체를 올바르게 복사해야 한다', () => {
      // Given
      const featureWithComplexProps = {
        id: 'complex-props',
        type: 'Feature',
        properties: {
          name: 'Complex Feature',
          nested: {
            level1: {
              level2: 'deep value',
            },
          },
          array: [1, 2, 3],
          number: 42,
          boolean: true,
          nullValue: null,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        },
      };

      // When
      const result = toSimpleFeature(featureWithComplexProps);

      // Then
      expect(result.properties).toEqual(featureWithComplexProps.properties);
      expect(result.properties.nested.level1.level2).toBe('deep value');
      expect(result.properties.array).toEqual([1, 2, 3]);
    });
  });

  describe('실제 데이터 시뮬레이션', () => {
    it('실제 국가 데이터와 유사한 Feature를 변환해야 한다', () => {
      // Given: 실제 GeoJSON에서 볼 수 있는 형태의 데이터
      const countryFeature = {
        id: 'KOR',
        type: 'Feature',
        properties: {
          name: 'South Korea',
          name_ko: '대한민국',
          iso_a2: 'KR',
          iso_a3: 'KOR',
          population: 51780579,
          gdp: 1630000000000,
        },
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            // 본토
            [
              [
                [126.97, 37.56],
                [127.0, 37.5],
                [126.95, 37.48],
                [126.97, 37.56],
              ],
            ],
            // 제주도
            [
              [
                [126.53, 33.5],
                [126.6, 33.48],
                [126.55, 33.45],
                [126.53, 33.5],
              ],
            ],
          ],
        },
      };

      // When
      const result = toSimpleFeature(countryFeature);

      // Then
      expect(result.id).toBe('KOR');
      expect(result.properties.name_ko).toBe('대한민국');
      expect(result.properties.population).toBe(51780579);
      expect(result.polygons).toHaveLength(2);
      // 본토 좌표 확인
      expect(result.polygons[0]?.[0]).toEqual([126.97, 37.56]);
      // 제주도 좌표 확인
      expect(result.polygons[1]?.[0]).toEqual([126.53, 33.5]);
    });
  });
});
