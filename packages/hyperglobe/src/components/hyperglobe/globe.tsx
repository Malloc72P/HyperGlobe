import { useLoader } from '@react-three/fiber';
import { useState } from 'react';
import { TextureLoader, RepeatWrapping } from 'three';

export interface GlobeProps {
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
  isRendered: boolean;
  setIsRendered: React.Dispatch<React.SetStateAction<boolean>>;
  wireframe?: boolean;
  rotation?: [number, number, number];
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
  position = [0, 0, 0],
  segments = [64, 32],
  isRendered,
  setIsRendered,
  wireframe,
}: GlobeProps) {
  /**
   * 지구 텍스처 로드
   */
  const earthTexture = useLoader(TextureLoader, '/earth-texture.jpg');
  // 텍스처 래핑 모드: 경계에서 반복되도록 설정 (UV 좌표가 0-1 범위를 벗어날 때)
  earthTexture.wrapS = earthTexture.wrapT = RepeatWrapping;

  return (
    <mesh
      position={position}
      onAfterRender={() => {
        if (!isRendered) {
          setIsRendered(true);
        }
      }}
    >
      {/* 구체 지오메트리: 반지름 1, 가로 세그먼트, 세로 세그먼트 */}
      <sphereGeometry args={[1, segments[0], segments[1]]} />
      {/* 지구 텍스처가 적용된 재질 */}
      <meshStandardMaterial map={earthTexture} wireframe={wireframe} />
    </mesh>
  );
}
