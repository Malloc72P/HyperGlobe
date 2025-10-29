import { useMemo } from 'react';
import * as THREE from 'three';
import type { Coordinate } from '../../types/coordinate';
import { LineFeature } from '../line-feature';
import { triangulatePolygon } from '../../lib/polygon/triangulate-polygon';
import type { FeaturePolygons } from '../../types/polygon';
import { UiConstant } from '../../constants';

export interface PolygonFeatureProps {
  /**
   * 폴리곤 좌표 배열
   *
   * - 피쳐를 구성하는 경위도 좌표를 순서대로 지정해야 합니다.
   */
  polygons: FeaturePolygons;

  /**
   * 선 색상
   */
  color?: string;

  /**
   * 선 두께
   */
  lineWidth?: number;

  /**
   * 면 채우기 활성화 여부
   */
  fill?: boolean;

  /**
   * 면 색상
   */
  fillColor?: string;

  /**
   * 면 투명도 (0~1)
   */
  fillOpacity?: number;

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

/**
 * 폴리곤 피쳐 컴포넌트.
 *
 * - 폴리곤 좌표 배열을 받아 다각형을 그립니다.
 */
export function PolygonFeature({
  polygons,
  lineWidth = 2,
  color = '#3a5dbb',
  fill = false,
  fillColor = '#78a9e2',
  fillOpacity = 1,
  wireframe = false,
  gridSpacing = 3,
  densifyBoundary = true,
}: PolygonFeatureProps) {
  // 면 렌더링을 위한 geometry 생성 (Delaunay 삼각분할)
  const fillGeometry = useMemo(() => {
    if (!fill) return null;

    const fillRadius = UiConstant.feature.fillRadius;

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
  }, [polygons, fill, gridSpacing, densifyBoundary]);

  return (
    <group>
      {/* 외곽선 렌더링 */}
      <LineFeature coordinates={polygons} color={color} lineWidth={lineWidth} />

      {/* 면 렌더링 */}
      {fill && fillGeometry && (
        <mesh geometry={fillGeometry}>
          <meshStandardMaterial
            color={fillColor}
            transparent
            opacity={fillOpacity}
            side={THREE.DoubleSide}
            wireframe={wireframe}
            // roughness={0.7}
            // metalness={0.5}
          />
        </mesh>
      )}
    </group>
  );
}
