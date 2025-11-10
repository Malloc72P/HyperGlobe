import type { Coordinate, RegionModel } from '@hyperglobe/interfaces';
import { OrthographicProj } from '@hyperglobe/tools';
import { useThree, useFrame } from '@react-three/fiber';
import { useMainStore } from 'src/store';
import { Euler, Matrix4, Vector3 } from 'three';

/**
 * 지구본 스타일
 *
 * - 구체의 색상을 지정하거나, 재질의 특성을 설정할 수 있습니다.
 */
export interface GlobeStyle {
  /**
   * 구체 색상
   */
  color?: string;
  /**
   * 재질의 거칠기
   *
   * - 값이 클수록 표면이 거칠어집니다.
   * - 0은 매끄러운 표면, 1은 매우 거친 표면을 의미합니다.
   * - 범위: 0 ~ 1
   *
   * @default 0.5
   */
  roughness?: number;
  /**
   * 재질의 금속성
   *
   * - 값이 클수록 금속성 효과가 강해집니다.
   * - 0은 비금속성, 1은 완전한 금속성을 의미합니다.
   * - 범위: 0 ~ 1
   *
   * @default 0
   */
  metalness?: number;
}

export interface GlobeProps extends GlobeStyle {
  /**
   * visible 여부
   */
  visible?: boolean;
  /**
   * 구체의 위치 (x, y, z)
   */
  position?: [number, number, number];
  /**
   * 구체의 세그먼트 수 (가로 세그먼트, 세로 세그먼트)
   *
   * @default [32, 16]
   */
  segments?: [number, number];
  /**
   * wireframe 여부
   */
  wireframe?: boolean;
  /**
   * 상위 컴포넌트에서 사용한 그룹에 대한 rotation
   * 이걸로 globe를 회전시키지 않으니 주의.
   */
  rotation: [number, number, number];
}

/**
 * # 구체 지오메트리
 *
 * ## 세그먼트
 *
 * - 구체를 가로, 세로로 자르는 선의 개수를 의미한다.
 * - 세그먼트 수가 많을수록 구체가 더 부드럽고 정교하게 표현된다.
 * - 세그먼트 수가 적으면 각진 형태가 나타난다.
 * - 순서대로, 가로, 세로 세그먼트이다.
 *
 * ### 가로 세그먼트
 * - 가로 세그먼트(widthSegments)는 구체를 세로로 자르는 선의 개수를 의미한다.
 * - 값이 클수록 구체의 가로 방향이 더 부드럽게 표현된다.
 *
 * ### 세로 세그먼트
 * - 세로 세그먼트(heightSegments)는 구체를 가로로 자르는 선의 개수를 의미한다.
 * - 값이 클수록 구체의 세로 방향이 더 부드럽게 표현된다.
 *
 * @param param0 GlobeProps
 * @returns JSX.Element
 */
export function Globe({
  wireframe,
  rotation,
  position = [0, 0, 0],
  segments = [64, 32],
  color = '#0077be',
  roughness = 0.5,
  metalness = 0,
}: GlobeProps) {
  const rTree = useMainStore((s) => s.tree);

  return (
    <mesh
      position={position}
      /**
       * 포인터 이벤트 캡처 방지
       *
       * - 지구 반대편 리젼 피쳐가 호버되지 않도록, 글로브에서 이벤트 전파를 막는다.
       */
      onPointerMove={(e) => {
        // 월드 좌표.
        // 이 좌표는 회전이 적용된 후의 좌표이다.
        // 해당 좌표의 경위도 좌표를 구하려면, 회전을 상쇄시키고 역투영해야한다.
        const point = e.point;

        // 회전 상쇄를 위한 회전행렬에 대한 역행렬 계산
        const inverseMatrix = new Matrix4();
        inverseMatrix.makeRotationFromEuler(new Euler(...rotation));
        inverseMatrix.invert();

        // 역행렬을 적용하여 회전이 상쇄된 로컬 좌표 계산
        const localPoint = new Vector3(point.x, point.y, point.z).applyMatrix4(inverseMatrix);
        const { x, y, z } = localPoint;

        // 역투영
        const coordinate = OrthographicProj.unproject([x, y, z]);
        let foundRegion: null | RegionModel = null;
        const searchResult = rTree.search({
          minX: coordinate[0],
          minY: coordinate[1],
          maxX: coordinate[0],
          maxY: coordinate[1],
        });

        for (const region of searchResult) {
          let found = false;
          const polygons = region.polygons;
          for (const polygon of polygons) {
            if (isPointInPolygon(coordinate, polygon)) {
              // 해당 좌표가 이 폴리곤 내부에 있음
              found = true;
              break;
            }
          }

          if (found) {
            foundRegion = region;
            break;
          }
        }

        console.log(foundRegion ? foundRegion.name : 'unknown');
      }}
    >
      {/* 구체 지오메트리: 반지름 1, 가로 세그먼트, 세로 세그먼트 */}
      <sphereGeometry args={[1, segments[0], segments[1]]} />
      {/* 지구 텍스처가 적용된 재질 */}
      <meshStandardMaterial
        wireframe={wireframe}
        color={color}
        roughness={roughness} // 매끄러운 표면
        metalness={metalness} // 약간의 금속성으로 반사효과
      />
    </mesh>
  );
}

export function isPointInPolygon(point: [number, number], polygon: Coordinate[]): boolean {
  // Ray casting 알고리즘
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}
