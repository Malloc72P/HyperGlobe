import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createSideGeometry } from './create-side-geometry';
import type { BorderlineSource } from '@hyperglobe/interfaces';

describe('createSideGeometry', () => {
  describe('기본 동작', () => {
    it('정사각형 외곽선에 대해 측면 geometry를 생성해야 한다', () => {
      // Arrange: 정사각형 외곽선 (4개의 점)
      const borderLines: BorderlineSource = {
        pointArrays: [
          new Float32Array([
            1.001, 0, 0, // 점1
            0, 1.001, 0, // 점2
            -1.001, 0, 0, // 점3
            0, -1.001, 0, // 점4
          ]),
        ],
      };

      // Act
      const geometry = createSideGeometry({
        borderLines,
        extrusionDepth: 0.001,
      });

      // Assert
      expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
      
      // 4개의 선분 × 4개의 정점 = 16개의 정점
      const positions = geometry.getAttribute('position');
      expect(positions.count).toBe(16);
      
      // 4개의 선분 × 2개의 삼각형 × 3개의 인덱스 = 24개의 인덱스
      const indices = geometry.getIndex();
      expect(indices?.count).toBe(24);
    });

    it('삼각형 외곽선에 대해 측면 geometry를 생성해야 한다', () => {
      // Arrange: 삼각형 외곽선 (3개의 점)
      const borderLines: BorderlineSource = {
        pointArrays: [
          new Float32Array([
            1.001, 0, 0,
            0, 1.001, 0,
            -0.5, -0.5, 1.001,
          ]),
        ],
      };

      // Act
      const geometry = createSideGeometry({
        borderLines,
        extrusionDepth: 0.001,
      });

      // Assert
      // 3개의 선분 × 4개의 정점 = 12개의 정점
      const positions = geometry.getAttribute('position');
      expect(positions.count).toBe(12);
      
      // 3개의 선분 × 2개의 삼각형 × 3개의 인덱스 = 18개의 인덱스
      const indices = geometry.getIndex();
      expect(indices?.count).toBe(18);
    });

    it('여러 외곽선(홀이 있는 폴리곤)에 대해 측면 geometry를 생성해야 한다', () => {
      // Arrange: 외곽선 2개 (바깥쪽 + 안쪽 홀)
      const borderLines: BorderlineSource = {
        pointArrays: [
          // 바깥쪽 사각형
          new Float32Array([
            2, 0, 0,
            0, 2, 0,
            -2, 0, 0,
            0, -2, 0,
          ]),
          // 안쪽 삼각형 (홀)
          new Float32Array([
            0.5, 0, 0,
            0, 0.5, 0,
            -0.5, -0.5, 0,
          ]),
        ],
      };

      // Act
      const geometry = createSideGeometry({
        borderLines,
        extrusionDepth: 0.001,
      });

      // Assert
      // (4개 선분 + 3개 선분) × 4개 정점 = 28개 정점
      const positions = geometry.getAttribute('position');
      expect(positions.count).toBe(28);
      
      // (4개 선분 + 3개 선분) × 2개 삼각형 × 3개 인덱스 = 42개 인덱스
      const indices = geometry.getIndex();
      expect(indices?.count).toBe(42);
    });
  });

  describe('정점 위치 검증', () => {
    it('위쪽 정점은 원래 위치에 있어야 한다', () => {
      // Arrange
      const borderLines: BorderlineSource = {
        pointArrays: [
          new Float32Array([
            1.001, 0, 0,
            0, 1.001, 0,
          ]),
        ],
      };

      // Act
      const geometry = createSideGeometry({
        borderLines,
        extrusionDepth: 0.001,
      });

      // Assert
      const positions = geometry.getAttribute('position');
      const array = positions.array as Float32Array;

      // 첫 번째 사각형의 첫 정점 (v0: 위쪽)
      expect(array[0]).toBeCloseTo(1.001, 5);
      expect(array[1]).toBeCloseTo(0, 5);
      expect(array[2]).toBeCloseTo(0, 5);

      // 첫 번째 사각형의 세 번째 정점 (v2: 다음 점 위쪽)
      expect(array[6]).toBeCloseTo(0, 5);
      expect(array[7]).toBeCloseTo(1.001, 5);
      expect(array[8]).toBeCloseTo(0, 5);
    });

    it('아래쪽 정점은 구 표면 방향으로 내려간 위치에 있어야 한다', () => {
      // Arrange
      const borderLines: BorderlineSource = {
        pointArrays: [
          new Float32Array([
            1.001, 0, 0,
            0, 1.001, 0,
          ]),
        ],
      };

      // Act
      const geometry = createSideGeometry({
        borderLines,
        extrusionDepth: 0.001,
      });

      // Assert
      const positions = geometry.getAttribute('position');
      const array = positions.array as Float32Array;

      // 첫 번째 사각형의 두 번째 정점 (v1: 아래쪽)
      // 원래: [1.001, 0, 0], 방향: [1, 0, 0], 새 거리: 1.000
      expect(array[3]).toBeCloseTo(1.000, 5);
      expect(array[4]).toBeCloseTo(0, 5);
      expect(array[5]).toBeCloseTo(0, 5);

      // 첫 번째 사각형의 네 번째 정점 (v3: 다음 점 아래쪽)
      // 원래: [0, 1.001, 0], 방향: [0, 1, 0], 새 거리: 1.000
      expect(array[9]).toBeCloseTo(0, 5);
      expect(array[10]).toBeCloseTo(1.000, 5);
      expect(array[11]).toBeCloseTo(0, 5);
    });

    it('방향 벡터가 올바르게 정규화되어야 한다', () => {
      // Arrange: 길이가 1이 아닌 벡터
      const borderLines: BorderlineSource = {
        pointArrays: [
          new Float32Array([
            3, 4, 0, // 길이 = 5
            0, 0, 5, // 길이 = 5
          ]),
        ],
      };

      // Act
      const geometry = createSideGeometry({
        borderLines,
        extrusionDepth: 1,
      });

      // Assert
      const positions = geometry.getAttribute('position');
      const array = positions.array as Float32Array;

      // 첫 번째 점 아래쪽 정점
      // 원래: [3, 4, 0], 길이: 5, 방향: [0.6, 0.8, 0], 새 거리: 4
      const bx1 = array[3];
      const by1 = array[4];
      const bz1 = array[5];
      expect(bx1).toBeCloseTo(0.6 * 4, 5); // 2.4
      expect(by1).toBeCloseTo(0.8 * 4, 5); // 3.2
      expect(bz1).toBeCloseTo(0, 5);

      // 거리 검증
      const distance1 = Math.sqrt(bx1 * bx1 + by1 * by1 + bz1 * bz1);
      expect(distance1).toBeCloseTo(4, 5);
    });
  });

  describe('인덱스 검증', () => {
    it('사각형이 올바른 순서의 삼각형으로 구성되어야 한다', () => {
      // Arrange
      const borderLines: BorderlineSource = {
        pointArrays: [
          new Float32Array([
            1, 0, 0,
            0, 1, 0,
          ]),
        ],
      };

      // Act
      const geometry = createSideGeometry({
        borderLines,
        extrusionDepth: 0.001,
      });

      // Assert
      const indices = geometry.getIndex();
      expect(indices).not.toBeNull();
      
      const indexArray = indices!.array;
      
      // 첫 번째 삼각형 (v0, v1, v2)
      expect(indexArray[0]).toBe(0);
      expect(indexArray[1]).toBe(1);
      expect(indexArray[2]).toBe(2);
      
      // 두 번째 삼각형 (v1, v3, v2)
      expect(indexArray[3]).toBe(1);
      expect(indexArray[4]).toBe(3);
      expect(indexArray[5]).toBe(2);
    });
  });

  describe('폐곡선 루프 검증', () => {
    it('마지막 선분이 마지막 점과 첫 점을 연결해야 한다', () => {
      // Arrange: 3개의 점
      const borderLines: BorderlineSource = {
        pointArrays: [
          new Float32Array([
            1, 0, 0, // 점0
            0, 1, 0, // 점1
            0, 0, 1, // 점2
          ]),
        ],
      };

      // Act
      const geometry = createSideGeometry({
        borderLines,
        extrusionDepth: 0.001,
      });

      // Assert
      const positions = geometry.getAttribute('position');
      const array = positions.array as Float32Array;

      // 세 번째 사각형 (마지막 선분: 점2 -> 점0)
      // v0: 점2 위쪽
      expect(array[24]).toBeCloseTo(0, 5);
      expect(array[25]).toBeCloseTo(0, 5);
      expect(array[26]).toBeCloseTo(1, 5);

      // v2: 점0 위쪽 (첫 점으로 루프)
      expect(array[30]).toBeCloseTo(1, 5);
      expect(array[31]).toBeCloseTo(0, 5);
      expect(array[32]).toBeCloseTo(0, 5);
    });
  });

  describe('extrusionDepth 옵션', () => {
    it('기본값 0.001을 사용해야 한다', () => {
      // Arrange
      const borderLines: BorderlineSource = {
        pointArrays: [
          new Float32Array([
            1.001, 0, 0,
            0, 1.001, 0,
          ]),
        ],
      };

      // Act: extrusionDepth를 명시하지 않음
      const geometry = createSideGeometry({ borderLines });

      // Assert
      const positions = geometry.getAttribute('position');
      const array = positions.array as Float32Array;

      // 아래쪽 정점의 거리가 1.000이어야 함 (1.001 - 0.001)
      const bx = array[3];
      const by = array[4];
      const bz = array[5];
      const distance = Math.sqrt(bx * bx + by * by + bz * bz);
      expect(distance).toBeCloseTo(1.000, 5);
    });

    it('커스텀 extrusionDepth를 적용해야 한다', () => {
      // Arrange
      const borderLines: BorderlineSource = {
        pointArrays: [
          new Float32Array([
            2.0, 0, 0,
            0, 2.0, 0,
          ]),
        ],
      };

      // Act
      const geometry = createSideGeometry({
        borderLines,
        extrusionDepth: 0.5,
      });

      // Assert
      const positions = geometry.getAttribute('position');
      const array = positions.array as Float32Array;

      // 아래쪽 정점의 거리가 1.5여야 함 (2.0 - 0.5)
      const bx = array[3];
      const by = array[4];
      const bz = array[5];
      const distance = Math.sqrt(bx * bx + by * by + bz * bz);
      expect(distance).toBeCloseTo(1.5, 5);
    });
  });

  describe('빈 입력 처리', () => {
    it('빈 pointArrays에 대해 빈 geometry를 생성해야 한다', () => {
      // Arrange
      const borderLines: BorderlineSource = {
        pointArrays: [],
      };

      // Act
      const geometry = createSideGeometry({ borderLines });

      // Assert
      const positions = geometry.getAttribute('position');
      expect(positions.count).toBe(0);
      
      const indices = geometry.getIndex();
      expect(indices?.count).toBe(0);
    });

    it('빈 Float32Array에 대해 빈 geometry를 생성해야 한다', () => {
      // Arrange
      const borderLines: BorderlineSource = {
        pointArrays: [new Float32Array([])],
      };

      // Act
      const geometry = createSideGeometry({ borderLines });

      // Assert
      const positions = geometry.getAttribute('position');
      expect(positions.count).toBe(0);
    });
  });

  describe('vertex normals', () => {
    it('vertex normals가 계산되어야 한다', () => {
      // Arrange
      const borderLines: BorderlineSource = {
        pointArrays: [
          new Float32Array([
            1, 0, 0,
            0, 1, 0,
            -1, 0, 0,
          ]),
        ],
      };

      // Act
      const geometry = createSideGeometry({ borderLines });

      // Assert
      const normals = geometry.getAttribute('normal');
      expect(normals).toBeDefined();
      expect(normals.count).toBe(12); // 3개 선분 × 4개 정점
    });
  });
});
