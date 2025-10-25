import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { OrthographicProj } from '../../lib/projections/orthographic';
import type { Coordinate, VectorCoordinate } from '../../types/coordinate';
import { LineFeature } from '../line-feature/line-feature';

export interface RectangleFeatureProps {
  /**
   * 사각형 좌표 배열.
   *
   * - 네 개의 경위도 좌표를 순서대로 지정해야 합니다.
   * - 순서대로 좌상단, 우상단, 우하단, 좌하단 좌표를 입력합니다.
   */
  coordinates: [Coordinate, Coordinate, Coordinate, Coordinate];

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
   * 그리드 세분화 정도 (숫자가 클수록 더 부드러운 곡면)
   */
  subdivisions?: number;

  /**
   * wireframe 모드 여부
   */
  wireframe?: boolean;
}

/**
 * 사각형 피쳐 컴포넌트.
 *
 * - 네 개의 좌표를 받아 사각형을 그립니다.
 * - 순서대로 좌상단, 우상단, 우하단, 좌하단 좌표를 입력합니다.
 */
export function RectangleFeature({
  coordinates,
  color = 'red',
  lineWidth = 2,
  fill = false,
  fillColor = 'red',
  fillOpacity = 0.3,
  subdivisions = 10,
  wireframe = false,
}: RectangleFeatureProps) {
  // BufferGeometry를 사용한 면 렌더링
  const fillGeometry = useMemo(() => {
    if (!fill) return null;

    // 1. 네 꼭지점을 3D 좌표로 변환 (면은 1.005 반지름에 배치)
    const fillRadius = 1.005;
    const corners = coordinates.map((coord) => OrthographicProj.project(coord, fillRadius));

    // 2. 네 변을 보간하여 그리드 생성
    const topEdge = OrthographicProj.interpolate(corners[0], corners[1], subdivisions, fillRadius);
    const bottomEdge = OrthographicProj.interpolate(
      corners[3],
      corners[2],
      subdivisions,
      fillRadius
    );

    // 3. 그리드 포인트 생성 (각 행을 보간)
    const gridPoints: VectorCoordinate[] = [];
    for (let i = 0; i <= subdivisions; i++) {
      const rowPoints = OrthographicProj.interpolate(
        topEdge[i],
        bottomEdge[i],
        subdivisions,
        fillRadius
      );
      gridPoints.push(...rowPoints);
    }

    // 4. Vertices 배열 생성
    const vertices: number[] = [];
    gridPoints.forEach((point) => {
      vertices.push(point[0], point[1], point[2]);
    });

    // 5. 삼각형 인덱스 생성
    const indices: number[] = [];
    const rowSize = subdivisions + 1;
    for (let row = 0; row < subdivisions; row++) {
      for (let col = 0; col < subdivisions; col++) {
        const topLeft = row * rowSize + col;
        const topRight = topLeft + 1;
        const bottomLeft = (row + 1) * rowSize + col;
        const bottomRight = bottomLeft + 1;

        // 첫 번째 삼각형 (topLeft, bottomLeft, topRight)
        indices.push(topLeft, bottomLeft, topRight);

        // 두 번째 삼각형 (topRight, bottomLeft, bottomRight)
        indices.push(topRight, bottomLeft, bottomRight);
      }
    }

    // 6. BufferGeometry 생성
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [coordinates, fill, subdivisions]);

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
      <LineFeature
        coordinates={[coordinates[0], coordinates[1]]}
        color={color}
        lineWidth={lineWidth}
      />
      <LineFeature
        coordinates={[coordinates[1], coordinates[2]]}
        color={color}
        lineWidth={lineWidth}
      />
      <LineFeature
        coordinates={[coordinates[2], coordinates[3]]}
        color={color}
        lineWidth={lineWidth}
      />
      <LineFeature
        coordinates={[coordinates[3], coordinates[0]]}
        color={color}
        lineWidth={lineWidth}
      />
    </group>
  );
}
