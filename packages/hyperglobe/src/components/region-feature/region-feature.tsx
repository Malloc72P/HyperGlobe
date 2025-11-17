import type { HGMFeature } from '@hyperglobe/interfaces';
import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { UiConstant } from '../../constants';
import { useFeatureStyle } from '../../hooks/use-feature-style';
import type { FeatureStyle } from '../../types/feature';
import { useRegionModel } from './use-region-model';
import type { ColorScaleModel } from 'src/types/colorscale';
import { Line } from '@react-three/drei';
import { createSideGeometry } from '../../lib/geometry';
import { Colors } from 'src/lib';

export interface RegionFeatureProps<DATA_TYPE = any> {
  /**
   * 지역의 피쳐 정보(GeoJson 형식).
   *
   * - 폴리곤, 멀티폴리곤 형식의 지오메트리만 지원합니다.
   */
  feature: HGMFeature;

  /**
   * 지역 스타일
   */
  style?: FeatureStyle;

  /**
   * 지역이 호버되었을때의 스타일
   */
  hoverStyle?: FeatureStyle;

  /**
   * wireframe 모드 여부
   */
  wireframe?: boolean;

  /**
   * 피쳐에 연결된 추가 데이터
   */
  data?: DATA_TYPE;

  /**
   * 컬러스케일.
   *
   * - 컬러스케일이 설정되면, 피쳐는 컬러스케일에 따라 색상이 결정됩니다.
   * - style보다 우선 적용됩니다.
   * - 주로 데이터 시각화에 사용됩니다.
   */
  colorscale?: ColorScaleModel;

  /**
   * 측면(extrusion) 옵션.
   *
   * - 폴리곤의 측면을 렌더링하여 입체감을 줍니다.
   * - z-fighting을 방지하기 위해 폴리곤이 구 표면에서 약간 떠있는 경우,
   *   측면을 추가하면 더 자연스러운 시각 효과를 얻을 수 있습니다.
   */
  extrusion?: {
    /**
     * 측면의 색상 (기본값: fillColor와 동일)
     *
     * - 지정하지 않으면 상단 면과 동일한 색상을 사용합니다.
     */
    color?: string;
  };
}

/**
 * 리전 피쳐 컴포넌트.
 *
 * - GeoJSON 형식의 피쳐 데이터를 받아 다각형을 그립니다.
 * - 멀티폴리곤과 싱글폴리곤을 모두 지원합니다.
 */
export function RegionFeature<DATA_TYPE = any>({
  feature,
  style = UiConstant.polygonFeature.default.style,
  hoverStyle = UiConstant.polygonFeature.default.hoverStyle,
  colorscale,
  data,
  extrusion = {
    color: Colors.GRAY[8],
  },
  ...polygonFeatureProps
}: RegionFeatureProps) {
  const [regionModel] = useRegionModel<DATA_TYPE>({ feature, data });
  const [appliedStyle] = useFeatureStyle({ regionModel, style, hoverStyle, colorscale });

  /**
   * 면 렌더링을 위한 geometry 생성 (Delaunay 삼각분할)
   */
  const meshSource = useMemo(() => {
    if (!feature) return;

    const geometries: THREE.BufferGeometry[] = [];

    for (const geometrySource of feature.geometries) {
      // 삼각분할된 지오메트리 정보 추출
      const { vertices: vertices, indices: indices } = geometrySource;

      // BufferGeometry 생성
      const geometry = new THREE.BufferGeometry();

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(Array.from(indices));
      geometry.computeVertexNormals();

      geometries.push(geometry);
    }

    return geometries;
  }, [feature]);

  /**
   * 드로우콜 최소화를 위해, 모든 폴리곤의 지오메트리를 병합
   *
   * 외곽선은 EdgesGeometry로 생성
   */
  const regionFeatureGeometry = useMemo(() => {
    if (!meshSource || !feature) return;

    // 면을 위한 지오메트리 병합
    const geometry = mergeGeometries(meshSource);

    const points: number[] = [];
    for (const pointArray of feature.borderLines.pointArrays) {
      points.push(...pointArray);
    }

    return {
      geometry,
      points,
    };
  }, [meshSource, feature]);

  /**
   * 측면 geometry 생성 (선택적)
   */
  const sideGeometry = useMemo(() => {
    if (!extrusion || !feature) return null;

    return createSideGeometry({
      borderLines: feature.borderLines,
      extrusionDepth: UiConstant.feature.extrusionDepth,
    });
  }, [feature, extrusion]);

  if (!feature || !regionFeatureGeometry) return;

  return (
    <group>
      {/* 상단 면 */}
      {regionFeatureGeometry?.geometry && (
        <mesh geometry={regionFeatureGeometry.geometry}>
          <meshBasicMaterial
            transparent
            side={THREE.DoubleSide}
            color={appliedStyle.fillColor}
            opacity={appliedStyle.fillOpacity}
            wireframe={polygonFeatureProps.wireframe}
          />
        </mesh>
      )}

      {/* 측면 */}
      {sideGeometry && (
        <mesh geometry={sideGeometry}>
          <meshBasicMaterial
            transparent
            side={THREE.DoubleSide}
            color={extrusion?.color ?? 'black'}
            opacity={1}
          />
        </mesh>
      )}

      {/* 외곽선 */}
      {regionFeatureGeometry?.points && (
        <Line
          points={regionFeatureGeometry.points}
          segments={true}
          color={appliedStyle.color}
          lineWidth={appliedStyle.lineWidth}
        />
      )}
    </group>
  );
}
