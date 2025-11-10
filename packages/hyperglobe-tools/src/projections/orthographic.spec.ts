import { describe, expect, it } from 'vitest';
import { OrthographicProj } from './orthographic';
import type { Coordinate, VectorCoordinate } from '@hyperglobe/interfaces';

describe('OrthographicProj', () => {
  describe('project', () => {
    it('경도 0도, 위도 0도 → [1, 0, 0]', () => {
      const result = OrthographicProj.project([0, 0]);
      expect(result[0]).toBeCloseTo(1, 5);
      expect(result[1]).toBeCloseTo(0, 5);
      expect(result[2]).toBeCloseTo(0, 5);
    });

    it('경도 90도, 위도 0도 → [0, 0, -1]', () => {
      const result = OrthographicProj.project([90, 0]);
      expect(result[0]).toBeCloseTo(0, 5);
      expect(result[1]).toBeCloseTo(0, 5);
      expect(result[2]).toBeCloseTo(-1, 5); // 경도에 -1을 곱하므로 z는 -1
    });

    it('경도 0도, 위도 90도 (북극점) → [0, 1, 0]', () => {
      const result = OrthographicProj.project([0, 90]);
      expect(result[0]).toBeCloseTo(0, 5);
      expect(result[1]).toBeCloseTo(1, 5);
      expect(result[2]).toBeCloseTo(0, 5);
    });

    it('서울 좌표 (126.978, 37.566) 투영', () => {
      const seoul: Coordinate = [126.978, 37.566];
      const result = OrthographicProj.project(seoul);

      console.log('서울 project 결과:', result);

      // 벡터의 크기가 1에 가까운지 확인
      const magnitude = Math.sqrt(result[0] ** 2 + result[1] ** 2 + result[2] ** 2);
      expect(magnitude).toBeCloseTo(1, 5);
    });
  });

  describe('unproject', () => {
    it('[1, 0, 0] → 경도 0도, 위도 0도', () => {
      const result = OrthographicProj.unproject([1, 0, 0]);
      expect(result[0]).toBeCloseTo(0, 5); // 경도
      expect(result[1]).toBeCloseTo(0, 5); // 위도
    });

    it('[0, 0, -1] → 경도 90도, 위도 0도', () => {
      const result = OrthographicProj.unproject([0, 0, -1]);
      expect(result[0]).toBeCloseTo(90, 5); // 경도
      expect(result[1]).toBeCloseTo(0, 5); // 위도
    });

    it('[0, 1, 0] → 경도 0도, 위도 90도 (북극점)', () => {
      const result = OrthographicProj.unproject([0, 1, 0]);
      expect(result[1]).toBeCloseTo(90, 5); // 위도
      // 북극점에서는 경도가 의미 없음
    });

    it('사용자 제공 point로 unproject', () => {
      const point: VectorCoordinate = [
        0.6285656443222519, 0.6088896584703873, -0.48028033361186623,
      ];

      const result = OrthographicProj.unproject(point);

      console.log('사용자 point unproject 결과:', result);
      console.log('경도:', result[0], '위도:', result[1]);

      // 벡터의 크기 확인
      const magnitude = Math.sqrt(point[0] ** 2 + point[1] ** 2 + point[2] ** 2);
      console.log('벡터 크기:', magnitude);
    });

    it('서울 좌표 왕복 변환 테스트 (project → unproject)', () => {
      const original: Coordinate = [126.978, 37.566];

      // project로 3D 좌표로 변환
      const projected = OrthographicProj.project(original);
      console.log('서울 projected:', projected);

      // unproject로 다시 경위도로 변환
      const unprojected = OrthographicProj.unproject(projected);
      console.log('서울 unprojected:', unprojected);

      // 원본과 비교
      expect(unprojected[0]).toBeCloseTo(original[0], 5); // 경도
      expect(unprojected[1]).toBeCloseTo(original[1], 5); // 위도
    });

    it('여러 도시 좌표 왕복 변환 테스트', () => {
      const cities: Coordinate[] = [
        [0, 0], // 아프리카 기니만
        [126.978, 37.566], // 서울
        [-74.006, 40.7128], // 뉴욕
        [139.6917, 35.6895], // 도쿄
        [2.3522, 48.8566], // 파리
        [0, 90], // 북극
        [0, -90], // 남극
      ];

      cities.forEach((original, index) => {
        const projected = OrthographicProj.project(original);
        const unprojected = OrthographicProj.unproject(projected);

        console.log(`\n도시 ${index}:`, original);
        console.log('projected:', projected);
        console.log('unprojected:', unprojected);

        // 극점이 아닌 경우에만 경도 검증
        if (Math.abs(original[1]) < 89) {
          expect(unprojected[0]).toBeCloseTo(original[0], 4); // 경도
        }
        expect(unprojected[1]).toBeCloseTo(original[1], 4); // 위도
      });
    });
  });
});
