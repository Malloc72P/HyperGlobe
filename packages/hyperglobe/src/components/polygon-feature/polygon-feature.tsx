import { useMemo } from 'react';
import * as THREE from 'three';
import type { Coordinate } from '../../types/coordinate';
import { LineFeature } from '../line-feature/line-feature';
import { triangulatePolygon } from '../../lib/polygon/triangulate-polygon';
import type { FeaturePolygons } from '../../types/polygon';

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
}

/**
 * 폴리곤 피쳐 컴포넌트.
 *
 * - 폴리곤 좌표 배열을 받아 다각형을 그립니다.
 */
export function PolygonFeature({
  polygons,
  color = 'red',
  lineWidth = 2,
  fill = false,
  fillColor = 'red',
  fillOpacity = 0.3,
  wireframe = false,
}: PolygonFeatureProps) {
  // 면 렌더링을 위한 geometry 생성 (Earcut 삼각분할)
  const fillGeometry = useMemo(() => {
    if (!fill) return null;

    const fillRadius = 1.005; // 외곽선(1.01)보다 낮게 설정하여 Z-fighting 방지

    // Earcut을 사용하여 폴리곤 삼각분할
    const { vertices, indices } = triangulatePolygon({
      coordinates: polygons,
      radius: fillRadius,
    });

    // BufferGeometry 생성
    const geometry = new THREE.BufferGeometry();

    // vertices를 flat array로 변환: [[x,y,z], [x,y,z]] => [x,y,z,x,y,z]
    const flatVertices = vertices.flatMap((v) => [v[0], v[1], v[2]]);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(flatVertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [polygons, fill]);

  return (
    <group>
      {/* 면 렌더링 */}
      {fill && fillGeometry && (
        <mesh geometry={fillGeometry}>
          <meshBasicMaterial
            color={fillColor}
            transparent
            opacity={fillOpacity}
            side={THREE.DoubleSide}
            wireframe={wireframe}
          />
        </mesh>
      )}

      {/* 외곽선 렌더링 */}
      {polygons.map((coord, index) => {
        const nextIndex = (index + 1) % polygons.length;
        return (
          <LineFeature
            key={`line-${index}`}
            coordinates={[coord, polygons[nextIndex]]}
            color={color}
            lineWidth={lineWidth}
          />
        );
      })}
    </group>
  );
}
