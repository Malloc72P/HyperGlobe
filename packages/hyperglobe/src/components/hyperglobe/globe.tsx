import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MeshStandardMaterial, TextureLoader } from 'three';

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
   * 렌더링 상태
   */
  isRendered: boolean;
  /**
   * 렌더링 상태 설정 함수
   */
  setIsRendered: React.Dispatch<React.SetStateAction<boolean>>;
  /**
   * wireframe 여부
   */
  wireframe?: boolean;
  /**
   * 텍스처 사용 여부
   */
  textureEnabled?: boolean;
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
  textureEnabled: _textureEnabled = true,
  visible = true,
  color = '#0077be',
  roughness,
  metalness,
}: GlobeProps) {
  /**
   * 텍스처 사용 여부 메모이제이션
   * - 초기 렌더링 시에만 결정됨.
   * - 런타임중에 변경하는 경우, 지구본 컴포넌트가 비정상적으로 그려지는 현상이 발생하여 이렇게 막았다.
   */
  const textureEnabled = useMemo(() => {
    return _textureEnabled;
  }, []);

  /**
   * 지구 텍스처 로드
   */
  const earthTexture = useLoader(TextureLoader, '/earth-texture.jpg');

  /**
   * 메쉬 마테리얼 참조 객체
   */
  const materialRef = useRef<MeshStandardMaterial>(null);

  /**
   * 텍스쳐 활성화 여부 props 변경시 마테리얼 업데이트
   */
  useEffect(() => {
    const material = materialRef.current;

    if (!material || !isRendered) return;

    material.map = textureEnabled ? earthTexture : null;
    material.needsUpdate = true;
  }, [textureEnabled]);

  return (
    <mesh
      visible={visible}
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
      <meshStandardMaterial
        ref={materialRef}
        map={textureEnabled ? earthTexture : null}
        wireframe={wireframe}
        color={textureEnabled ? 'unset' : color}
        roughness={roughness} // 매끄러운 표면
        metalness={metalness} // 약간의 금속성으로 반사효과
      />
    </mesh>
  );
}
