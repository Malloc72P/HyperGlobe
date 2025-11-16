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

  if (!feature || !regionFeatureGeometry) return;

  return (
    <group>
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
