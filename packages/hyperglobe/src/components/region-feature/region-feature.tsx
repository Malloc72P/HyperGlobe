import { useMemo, useState } from 'react';
import { UiConstant } from '../../constants';
import { useFeatureStyle } from '../../hooks/use-feature-style';
import type { FeatureStyle } from '../../types/feature';
import type { FeaturePolygons } from '@hyperglobe/interfaces';
import { PolygonFeature } from '../polygon-feature/polygon-feature';
import type { RegionModel } from '../../types/region';
import { useMainStore } from '../../store';
import { OrthographicProj, triangulatePolygon } from '../../lib';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LineFeature } from '../line-feature';

export interface RegionFeatureProps {
  /**
   * 지역의 피쳐 정보(GeoJson 형식).
   *
   * - 폴리곤, 멀티폴리곤 형식의 지오메트리만 지원합니다.
   */
  feature: any;

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

  /**
   * 리전 모델 정보
   */
  const regionModel = useMemo<RegionModel>(() => {
    return {
      id: feature.id,
      name: feature.properties.name || '',
    };
  }, [feature]);

  /**
   * 피쳐의 폴리곤 배열
   *
   * - 멀티폴리곤과 싱글폴리곤을 일관된 방법으로 처리할 수 있도록, 하나의 폴리곤 배열로 반환함.
   */
  const featurePolygons = useMemo(() => {
    // 멀티, 싱글 폴리곤 전부 처리할 수 있어야 함.
    const _featurePolygons: FeaturePolygons[] = [];

    if (feature.geometry.coordinates.length === 0) return;

    if (feature.geometry.type === 'Polygon') {
      // 첫번째는 경계정보 폴리곤. 그 다음부터는 구멍(holes) 정보 폴리곤
      const borderlinePolygon = feature.geometry.coordinates[0];

      _featurePolygons.push(borderlinePolygon as FeaturePolygons);
    } else {
      for (const singlePolygon of feature.geometry.coordinates) {
        // 첫번째는 경계정보 폴리곤. 그 다음부터는 구멍(holes) 정보 폴리곤
        const borderlinePolygon = singlePolygon[0];

        _featurePolygons.push(borderlinePolygon as FeaturePolygons);
      }
    }

    return _featurePolygons;
  }, []);

  /**
   * 면 렌더링을 위한 geometry 생성 (Delaunay 삼각분할)
   */
  const meshSource = useMemo(() => {
    if (!featurePolygons) return;

    const gridSpacing = 3;
    const densifyBoundary = true;
    const fillRadius = UiConstant.feature.fillRadius;

    const geometries: THREE.BufferGeometry[] = [];

    for (const polygon of featurePolygons) {
      // Delaunay 삼각분할
      const { vertices, indices } = triangulatePolygon({
        coordinates: polygon,
        radius: fillRadius,
        gridSpacing,
        densifyBoundary,
      });

      // BufferGeometry 생성
      const geometry = new THREE.BufferGeometry();

      // vertices를 flat array로 변환: [[x,y,z], [x,y,z]] => [x,y,z,x,y,z]
      const flatVertices = vertices.flatMap((v) => [v[0], v[1], v[2]]);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(flatVertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();

      geometries.push(geometry);
    }

    return geometries;
  }, [featurePolygons]);

  /**
   * 드로우콜 최소화를 위해, 모든 폴리곤의 지오메트리를 병합
   *
   * 외곽선은 EdgesGeometry로 생성
   */
  const regionFeatureGeometry = useMemo(() => {
    if (!meshSource || !featurePolygons) return;

    const geometry = mergeGeometries(meshSource);
    const fillRadius = UiConstant.feature.strokeRadius;
    const positions: number[] = [];

    // 각 폴리곤을 독립적으로 처리
    for (const polygon of featurePolygons) {
      const projectedPoints = OrthographicProj.projects(polygon, fillRadius);

      // 이 폴리곤 내부에서만 선분 생성
      for (let i = 0; i < projectedPoints.length; i++) {
        const [x1, y1, z1] = projectedPoints[i];
        // 마지막 점은 첫 점과 연결 (폴리곤 닫기)
        const nextIndex = (i + 1) % projectedPoints.length;
        const [x2, y2, z2] = projectedPoints[nextIndex];

        // 선분 추가: 시작점 -> 끝점
        positions.push(x1, y1, z1);
        positions.push(x2, y2, z2);
      }
      // 여기서 끊김! 다음 폴리곤으로 넘어감
    }

    const borderlineGeometry = new THREE.BufferGeometry();
    borderlineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    return {
      geometry,
      borderlineGeometry,
    };
  }, [meshSource, featurePolygons]);

  if (!featurePolygons) return;

  return (
    <group
    //   onPointerEnter={(e) => {
    //     e.stopPropagation();

    //     setHovered(true);
    //     setHoveredRegion(regionModel);
    //   }}
    //   onPointerLeave={(e) => {
    //     e.stopPropagation();

    //     setHovered(false);
    //     setHoveredRegion(null);
    //   }}
    >
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
