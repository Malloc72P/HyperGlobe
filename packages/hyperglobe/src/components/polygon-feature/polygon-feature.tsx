import { memo, useMemo } from 'react';
import * as THREE from 'three';
import { UiConstant } from '../../constants';
import { MathConstants, triangulatePolygon } from '../../../../hyperglobe-tools/src';
import type { FeatureStyle } from '../../types/feature';
import type { FeaturePolygons } from '@hyperglobe/interfaces';
import { LineFeature } from '../line-feature';

export interface PolygonFeatureProps {
  /**
   * 폴리곤 좌표 배열
   *
   * - 피쳐를 구성하는 경위도 좌표를 순서대로 지정해야 합니다.
   */
  polygons: FeaturePolygons;

  /**
   * 폴리곤 스타일(외곽선, 면 채우기 등)
   */
  style?: FeatureStyle;

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

  /**
   * wireframe 모드 여부
   */
  wireframe?: boolean;

  /**
   * 내부 격자점 간격 (도 단위)
   * 작을수록 더 촘촘한 삼각형 생성
   *
   * @default 3
   *
   * @example
   * ```tsx
   * // 기본 사용 (3도 간격)
   * <PolygonFeature />
   *
   * // 더 촘촘하게 (1도 간격)
   * <PolygonFeature gridSpacing={1} />
   *
   * // 더 성기게 (5도 간격)
   * <PolygonFeature gridSpacing={5} />
   * ```
   */
  gridSpacing?: number;

  /**
   * 경계선 densification 활성화
   * simplify된 데이터에서 경계가 성글 때 유용
   *
   * @default true
   *
   * @example
   * ```tsx
   * // 경계선 보간 활성화 (권장)
   * <PolygonFeature densifyBoundary />
   *
   * // 비활성화
   * <PolygonFeature densifyBoundary={false} />
   * ```
   */
  densifyBoundary?: boolean;
}

export const PolygonFeature = memo(_PolygonFeature);

/**
 * 폴리곤 피쳐 컴포넌트.
 *
 * - 폴리곤 좌표 배열을 받아 다각형을 그립니다.
 * - polygons props에 폴리곤 좌표 배열을 전달해야 합니다.
 */
function _PolygonFeature({
  polygons,
  style,
  wireframe = false,
  gridSpacing = 3,
  densifyBoundary = true,
  roughness,
  metalness,
}: PolygonFeatureProps) {
  // 면 렌더링을 위한 geometry 생성 (Delaunay 삼각분할)
  const fillGeometry = useMemo(() => {
    const fillRadius = MathConstants.FEATURE_FILL_Z_INDEX;

    // Delaunay 삼각분할
    const { vertices, indices } = triangulatePolygon({
      coordinates: polygons,
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

    return geometry;
  }, [polygons, gridSpacing, densifyBoundary]);

  return (
    <group>
      {/* 외곽선 렌더링 */}
      <LineFeature coordinates={polygons} color={style?.color} lineWidth={style?.lineWidth} />

      {/* 면 렌더링 */}
      <mesh geometry={fillGeometry}>
        <meshStandardMaterial
          transparent
          side={THREE.DoubleSide}
          color={style?.fillColor}
          opacity={style?.fillOpacity}
          wireframe={wireframe}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
    </group>
  );
}
