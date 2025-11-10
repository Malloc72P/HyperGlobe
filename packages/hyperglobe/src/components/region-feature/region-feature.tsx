import type {
  Coordinate,
  FeaturePolygons,
  HGMFeature,
  VectorCoordinate,
} from '@hyperglobe/interfaces';
import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { UiConstant } from '../../constants';
import { useFeatureStyle } from '../../hooks/use-feature-style';
import { useMainStore } from '../../store';
import type { FeatureStyle } from '../../types/feature';
import type { RegionModel } from '@hyperglobe/interfaces';
import { MathConstants, OrthographicProj } from '@hyperglobe/tools';

export interface RegionFeatureProps {
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
   * 재질의 거칠기
   *
   * - 값이 클수록 표면이 거칠어집니다.
   * - 0은 매끄러운 표면, 1은 매우 거친 표면을 의미합니다.
   * - 범위: 0 ~ 1
   */
  roughness?: number;

  /**
   * 재질의 금속성
   *
   * - 값이 클수록 금속성 효과가 강해집니다.
   * - 0은 비금속성, 1은 완전한 금속성을 의미합니다.
   * - 범위: 0 ~ 1
   */
  metalness?: number;
}

/**
 * 리전 피쳐 컴포넌트.
 *
 * - GeoJSON 형식의 피쳐 데이터를 받아 다각형을 그립니다.
 * - 멀티폴리곤과 싱글폴리곤을 모두 지원합니다.
 */
export function RegionFeature({
  feature,
  style = UiConstant.polygonFeature.default.style,
  hoverStyle = UiConstant.polygonFeature.default.hoverStyle,
  ...polygonFeatureProps
}: RegionFeatureProps) {
  const [hovered, setHovered] = useState(false);
  const [appliedStyle] = useFeatureStyle({ hovered, style, hoverStyle });
  const setHoveredRegion = useMainStore((s) => s.setHoveredRegion);
  const insertRegionModel = useMainStore((s) => s.insertRegionModel);
  const removeRegionModel = useMainStore((s) => s.removeRegionModel);

  /**
   * 리전 모델 정보
   */
  const regionModel = useMemo<RegionModel>(() => {
    const width = Math.abs(feature.bbox.maxX - feature.bbox.minX);
    const height = Math.abs(feature.bbox.maxY - feature.bbox.minY);
    const newModel: RegionModel = {
      id: feature.id,
      name: feature.properties.name || '',
      polygons: feature.borderLines.pointArrays.map((typedArr) =>
        Array.from(typedArr).reduce((acc, curr, i, array) => {
          if (i % 3 !== 0 || i + 2 >= array.length) return acc;

          const vector: VectorCoordinate = [curr, array[i + 1], array[i + 2]];
          const coordinate = OrthographicProj.unproject(
            vector,
            MathConstants.FEATURE_STROKE_Z_INDEX
          );

          acc.push(coordinate);

          return acc;
        }, [] as FeaturePolygons)
      ),
      bboxSize: width * height,
      ...feature.bbox,
    };

    insertRegionModel(newModel);

    return newModel;
  }, [feature]);

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

    const borderlineGeometry = new THREE.BufferGeometry();
    borderlineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

    return {
      geometry,
      borderlineGeometry,
    };
  }, [meshSource, feature]);

  if (!feature || !regionFeatureGeometry) return;

  return (
    <group>
      {regionFeatureGeometry?.geometry && (
        <mesh geometry={regionFeatureGeometry.geometry}>
          <meshStandardMaterial
            transparent
            side={THREE.DoubleSide}
            color={appliedStyle.fillColor}
            opacity={appliedStyle.fillOpacity}
            wireframe={polygonFeatureProps.wireframe}
            roughness={polygonFeatureProps.roughness}
            metalness={polygonFeatureProps.metalness}
          />
        </mesh>
      )}
      {regionFeatureGeometry?.borderlineGeometry && (
        <lineSegments geometry={regionFeatureGeometry.borderlineGeometry}>
          <lineBasicMaterial color={appliedStyle.color} linewidth={appliedStyle.lineWidth} />
        </lineSegments>
      )}
    </group>
  );
}
