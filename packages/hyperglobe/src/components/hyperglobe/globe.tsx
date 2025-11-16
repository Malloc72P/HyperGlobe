import { findRegionByVector } from '@hyperglobe/tools';
import { UiConstant } from 'src/constants';
import { useThrottle } from 'src/hooks/use-throttle';
import { useMainStore } from 'src/store';
import type { OnHoverChangedFn } from 'src/types/events';

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
  /**
   * 호버된 지역이 변경될 때 호출되는 콜백 함수
   */
  onHoverChanged?: OnHoverChangedFn;
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
 */
export function Globe({
  wireframe,
  onHoverChanged,
  position = [0, 0, 0],
  segments = [64, 32],
  color = '#0077be',
  roughness = 0.5,
  metalness = 0,
}: GlobeProps) {
  const rTree = useMainStore((s) => s.tree);
  const setHoveredRegion = useMainStore((s) => s.setHoveredRegion);

  const onPointerMove = useThrottle({
    fn: (e) => {
      const { point } = e;

      const foundRegion = findRegionByVector({
        rTree,
        rotation: UiConstant.globe.rotation,
        vector: point,
      });

      setHoveredRegion(foundRegion);
      onHoverChanged?.({
        hoveredRegion: foundRegion,
      });
    },
    delay: 50,
  });

  return (
    <mesh
      position={position}
      /**
       * 포인터 이벤트 캡처 방지
       *
       * - 지구 반대편 리젼 피쳐가 호버되지 않도록, 글로브에서 이벤트 전파를 막는다.
       */
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        setHoveredRegion(null);
      }}
    >
      {/* 구체 지오메트리: 반지름 1, 가로 세그먼트, 세로 세그먼트 */}
      <sphereGeometry args={[1, segments[0], segments[1]]} />
      {/* 지구 텍스처가 적용된 재질 */}
      <meshStandardMaterial
        wireframe={wireframe}
        color={color}
        // roughness={roughness} // 매끄러운 표면
        // metalness={metalness} // 약간의 금속성으로 반사효과
      />
    </mesh>
  );
}
