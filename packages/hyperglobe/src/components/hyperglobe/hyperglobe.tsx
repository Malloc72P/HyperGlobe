import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Globe } from './globe';
import { CoordinateSystem } from '../coordinate-system';
import { useState, type PropsWithChildren } from 'react';

/**
 * HyperGlobe 컴포넌트의 Props
 */
export interface HyperGlobeProps extends PropsWithChildren {
  /**
   * Canvas 요소의 id 속성
   */
  id?: string;
  /**
   * 지구본의 크기
   */
  size?: number;
  /**
   * 좌표축 시각화 여부
   */
  coordinateSystemVisible?: boolean;
  /**
   * wireframe
   */
  wireframe?: boolean;
  /**
   * 지구본의 초기 회전 각도 (라디안 단위)
   */
  rotation?: [number, number, number];
  /**
   * 텍스처 사용 여부
   */
  textureEnabled?: boolean;
  /**
   * 지구 보이기 여부
   */
  globeVisible?: boolean;
}

/**
 * **WEBGL 기반 지구본 컴포넌트.**
 *
 * 마우스 드래그를 통해 지구본을 회전시키고, 휠 스크롤로 확대/축소할 수 있습니다.
 */
export function HyperGlobe({
  id,
  size = 600,
  coordinateSystemVisible,
  wireframe,
  children,
  rotation = [0, -Math.PI / 2, 0],
  textureEnabled = true,
  globeVisible = true,
}: HyperGlobeProps) {
  const [isRendered, setIsRendered] = useState<boolean>(false);

  return (
    <Canvas
      id={id}
      style={{ height: size }}
      // 초기 카메라 위치
      camera={{ position: [0, 0, 5], fov: 25 }}
      data-is-rendered={isRendered ? 'true' : 'false'}
    >
      {/* 기본 조명 설정 */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* 마우스로 카메라 조작 가능하게 하는 컨트롤 */}
      <OrbitControls
        enableZoom={true}
        enableRotate={true}
        /**
         * 카메라가 타겟에 얼마나 가까이 갈 수 있는지를 제한
         */
        minDistance={3}
        /**
         * 카메라가 타겟에서 얼마나 멀어질 수 있는지를 제한
         */
        maxDistance={10}
      />

      {/* 지구본과 피쳐를 그룹으로 묶어 함께 회전 */}
      <group rotation={rotation}>
        <Globe
          visible={globeVisible}
          isRendered={isRendered}
          setIsRendered={setIsRendered}
          wireframe={wireframe}
          textureEnabled={textureEnabled}
        />

        {/* Children */}
        {children}
      </group>

      {/* 좌표축 시각화 헬퍼들 */}
      {coordinateSystemVisible && <CoordinateSystem />}
    </Canvas>
  );
}
