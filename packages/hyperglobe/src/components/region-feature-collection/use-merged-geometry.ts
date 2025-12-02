import type { HGMFeature } from '@hyperglobe/interfaces';
import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { UiConstant } from '../../constants';
import { createSideGeometry } from '../../lib/geometry';

export interface MergedGeometryResult {
  /** 병합된 상단 면 지오메트리 */
  faceGeometry: THREE.BufferGeometry;
  /** 병합된 측면 지오메트리 */
  sideGeometry: THREE.BufferGeometry | null;
  /** 병합된 외곽선 좌표 배열 */
  borderPoints: number[];
}

export interface UseMergedGeometryOptions {
  /** 병합할 features 배열 */
  features: HGMFeature[];
  /** extrusion 활성화 여부 */
  enableExtrusion?: boolean;
}

/**
 * HGMFeature의 geometries를 BufferGeometry 배열로 변환
 * (중복 제거를 위한 헬퍼 함수)
 */
function createFaceGeometriesFromFeature(feature: HGMFeature): THREE.BufferGeometry[] {
  return feature.geometries.map((geometrySource) => {
    const { vertices, indices } = geometrySource;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(Array.from(indices));
    geometry.computeVertexNormals();

    return geometry;
  });
}

/**
 * HGMFeature의 borderLines를 좌표 배열로 변환
 * (중복 제거를 위한 헬퍼 함수)
 */
function createBorderPointsFromFeature(feature: HGMFeature): number[] {
  const points: number[] = [];
  for (const pointArray of feature.borderLines.pointArrays) {
    points.push(...pointArray);
  }
  return points;
}

/**
 * 여러 feature의 지오메트리를 하나로 병합하는 훅
 *
 * - 상단 면: 모든 feature의 폴리곤을 하나의 BufferGeometry로 병합
 * - 측면: 모든 feature의 측면을 하나의 BufferGeometry로 병합
 * - 외곽선: 모든 feature의 외곽선 좌표를 하나의 배열로 병합
 */
export function useMergedGeometry({
  features,
  enableExtrusion = true,
}: UseMergedGeometryOptions): MergedGeometryResult | null {
  return useMemo(() => {
    if (!features || features.length === 0) return null;

    // 1. 상단 면 지오메트리 병합
    const faceGeometries: THREE.BufferGeometry[] = [];
    for (const feature of features) {
      faceGeometries.push(...createFaceGeometriesFromFeature(feature));
    }
    const faceGeometry = mergeGeometries(faceGeometries);

    // 2. 측면 지오메트리 병합
    let sideGeometry: THREE.BufferGeometry | null = null;
    if (enableExtrusion) {
      const sideGeometries = features.map((feature) =>
        createSideGeometry({
          borderLines: feature.borderLines,
          extrusionDepth: UiConstant.feature.extrusionDepth,
        })
      );
      sideGeometry = mergeGeometries(sideGeometries);
    }

    // 3. 외곽선 좌표 병합
    const borderPoints: number[] = [];
    for (const feature of features) {
      borderPoints.push(...createBorderPointsFromFeature(feature));
    }

    // 개별 지오메트리 정리 (메모리 해제)
    faceGeometries.forEach((geo) => geo.dispose());

    return {
      faceGeometry,
      sideGeometry,
      borderPoints,
    };
  }, [features, enableExtrusion]);
}

/**
 * 단일 feature의 지오메트리를 생성하는 함수 (호버 오버레이용)
 */
export function createFeatureGeometry(feature: HGMFeature): {
  faceGeometry: THREE.BufferGeometry;
  sideGeometry: THREE.BufferGeometry;
  borderPoints: number[];
} {
  const faceGeometries = createFaceGeometriesFromFeature(feature);
  const faceGeometry = mergeGeometries(faceGeometries);

  const sideGeometry = createSideGeometry({
    borderLines: feature.borderLines,
    extrusionDepth: UiConstant.feature.extrusionDepth,
  });

  const borderPoints = createBorderPointsFromFeature(feature);

  // 개별 지오메트리 정리
  faceGeometries.forEach((geo) => geo.dispose());

  return {
    faceGeometry,
    sideGeometry,
    borderPoints,
  };
}
