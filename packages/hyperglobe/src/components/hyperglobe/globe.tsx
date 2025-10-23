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
}: GlobeProps) {
  /**
   * 지구 텍스처 로드
   */
  const earthTexture = useLoader(TextureLoader, '/earth-texture.jpg');

  /**
   * 텍스처 UV 매핑 조정
   *
   * 사용하는 텍스처 이미지의 맨 왼쪽은 태평양(경도 -180°, 러시아-알래스카 경계)이다.
   * Three.js SphereGeometry는 기본적으로 텍스처의 왼쪽 끝을 구체의 -X축 방향에 매핑한다.
   *
   * 기본 상태에서는 카메라 정면(+Z축에서 바라본 -Z 방향)에 경도 -90°가 보인다.
   * 우리가 원하는 것은 경도 0°(그리니치 자오선)가 정면에 오는 것이다.
   *
   * 따라서 텍스처를 90° 동쪽으로 이동시켜야 한다.
   * offset.x = 0.25는 텍스처를 25% = 90° 이동시킨다. (90° / 360° = 0.25)
   *
   * 결과: 경도 0°(아프리카 서해안)이 카메라 정면에 위치하게 된다.
   */
  earthTexture.offset.x = 0.25;

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
      <meshStandardMaterial map={earthTexture} wireframe={false} />
    </mesh>
  );
}
