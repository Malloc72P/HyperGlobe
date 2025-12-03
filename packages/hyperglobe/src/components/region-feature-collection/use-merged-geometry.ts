import type { HGMFeature } from '@hyperglobe/interfaces';
import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { UiConstant } from '../../constants';
import { createSideGeometry } from '../../lib/geometry';
import type { ColorScaleModel } from '../../types/colorscale';
import type { FeatureStyle } from '../../types/feature';
import { computeFeatureStyle } from '../../hooks/use-feature-style';

export interface MergedGeometryResult {
  /** 병합된 상단 면 지오메트리 */
  faceGeometry: THREE.BufferGeometry;
  /** 병합된 측면 지오메트리 */
  sideGeometry: THREE.BufferGeometry | null;
  /** 병합된 외곽선 좌표 배열 */
  borderPoints: number[];
  /** vertex color 사용 여부 */
  useVertexColors: boolean;
}

export interface UseMergedGeometryOptions {
  /** 병합할 features 배열 */
  features: HGMFeature[];
  /** extrusion 활성화 여부 */
  enableExtrusion?: boolean;
  /** 기본 스타일 */
  style?: FeatureStyle;
  /** 컬러스케일 모델 */
  colorscale?: ColorScaleModel;
  /** feature별 데이터 (컬러스케일 적용용) */
  data?: any;
  /** feature의 id로 사용할 속성 이름 */
  idField?: string;
  /** feature의 값(value)으로 사용할 속성 이름 */
  valueField: string;
}

/**
 * feature에서 데이터 키를 추출하는 헬퍼 함수
 */
export function getFeatureKey(feature: HGMFeature, idField?: string): string {
  if (idField && feature.properties) {
    return String(feature.properties[idField] ?? feature.id);
  }
  return feature.id;
}

/**
 * hex 색상 문자열을 RGB 배열로 변환
 */
function hexToRgb(hex: string): [number, number, number] {
  const color = new THREE.Color(hex);
  return [color.r, color.g, color.b];
}

/**
 * HGMFeature의 geometries를 BufferGeometry 배열로 변환
 * (중복 제거를 위한 헬퍼 함수)
 */
function createFaceGeometriesFromFeature(
  feature: HGMFeature,
  color?: [number, number, number]
): THREE.BufferGeometry[] {
  return feature.geometries.map((geometrySource) => {
    const { vertices, indices } = geometrySource;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(Array.from(indices));
    geometry.computeVertexNormals();

    // vertex color 적용(color는 RGB 배열)
    if (color) {
      // x,y,z 각각에 대해 동일한 색상 할당
      const vertexCount = vertices.length / 3;
      const colors = new Float32Array(vertices.length);
      for (let i = 0; i < vertexCount; i++) {
        colors[i * 3] = color[0];
        colors[i * 3 + 1] = color[1];
        colors[i * 3 + 2] = color[2];
      }
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    }

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
 * - colorscale + data가 있으면 vertex color 적용
 */
export function useMergedGeometry({
  features,
  enableExtrusion = true,
  style,
  colorscale,
  data,
  idField,
  valueField,
}: UseMergedGeometryOptions): MergedGeometryResult | null {
  return useMemo(() => {
    if (!features || features.length === 0) return null;

    // colorscale + data가 있으면 vertex color 사용
    const useVertexColors = !!(colorscale && data);

    // 1. 상단 면 지오메트리 병합
    const faceGeometries: THREE.BufferGeometry[] = [];
    for (const feature of features) {
      let color: [number, number, number] | undefined;

      if (useVertexColors) {
        const key = getFeatureKey(feature, idField);
        const dataValue = data[key]?.[valueField];

        // 해당 피쳐의 스타일 계산(컬러스케일 고려)
        const featureStyle = computeFeatureStyle({
          style,
          colorscale,
          dataValue,
        });

        if (featureStyle.fillColor) {
          color = hexToRgb(featureStyle.fillColor);
        }
      }

      faceGeometries.push(...createFaceGeometriesFromFeature(feature, color));
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
      useVertexColors,
    };
  }, [features, enableExtrusion, style, colorscale, data, idField]);
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
