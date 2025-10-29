import { useMemo } from 'react';
import * as THREE from 'three';
import type { Coordinate } from '../../types/coordinate';
import { LineFeature } from '../line-feature';
import { triangulatePolygon, type SubdivisionOptions } from '../../lib/polygon/triangulate-polygon';
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
   * 삼각형 세분화 옵션
   * 큰 폴리곤에서 더 부드러운 곡면을 위해 사용
   *
   * @example
   * ```tsx
   * // 기본 세분화 (적당한 품질)
   * <PolygonFeature subdivision={{}} />
   *
   * // 높은 품질 세분화
   * <PolygonFeature subdivision={{
   *   maxDepth: 4,
   *   maxTriangleArea: 0.005,
   *   maxEdgeLength: 0.1
   * }} />
   * ```
   */
  subdivision?: SubdivisionOptions;

  /**
   * 경계 밀집화 옵션
   * 큰 삼각형 생성을 방지하여 면이 찢어지는 현상 해결
   *
   * @default true (자동으로 적절한 밀집도 계산)
   * @deprecated useDelaunay를 사용하세요
   *
   * @example
   * ```tsx
   * // 자동 밀집화 (권장)
   * <PolygonFeature densifyBoundary />
   *
   * // 수동 밀집화
   * <PolygonFeature densifyBoundary={0.1} />
   *
   * // 밀집화 비활성화
   * <PolygonFeature densifyBoundary={false} />
   * ```
   */
  densifyBoundary?: boolean | number;

  /**
   * Delaunay 삼각분할 사용 (권장)
   * 균등한 크기의 삼각형 생성으로 면 찢어짐 방지
   *
   * @default true
   *
   * @example
   * ```tsx
   * // 기본 사용 (권장)
   * <PolygonFeature useDelaunay />
   *
   * // 더 촘촘하게 (gridSpacing 2도)
   * <PolygonFeature useDelaunay={2} />
   *
   * // 비활성화
   * <PolygonFeature useDelaunay={false} />
   * ```
   */
  useDelaunay?: boolean | number;
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
  subdivision,
  densifyBoundary,
  useDelaunay = 3, // 기본값: Delaunay 사용
}: PolygonFeatureProps) {
  // 면 렌더링을 위한 geometry 생성 (Delaunay 또는 Earcut 삼각분할)
  const fillGeometry = useMemo(() => {
    if (!fill) return null;

    const fillRadius = UiConstant.feature.fillRadius;

    // 삼각분할 (Delaunay 또는 Earcut + subdivision/densification)
    const { vertices, indices } = triangulatePolygon({
      coordinates: polygons,
      radius: fillRadius,
      subdivision, // 세분화 옵션 전달
      densifyBoundary, // 경계 밀집화 옵션 전달 (deprecated)
      useDelaunay, // Delaunay 옵션 전달 (권장)
    });

    // BufferGeometry 생성
    const geometry = new THREE.BufferGeometry();

    // vertices를 flat array로 변환: [[x,y,z], [x,y,z]] => [x,y,z,x,y,z]
    const flatVertices = vertices.flatMap((v) => [v[0], v[1], v[2]]);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(flatVertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [polygons, fill, subdivision, densifyBoundary, useDelaunay]);

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
