import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Globe } from './globe';
import { CoordinateSystem } from '../coordinate-system';

export interface HyperGlobeProps {
  /**
   * 지구본의 크기
   */
  size?: number;
  /**
   * 좌표축 시각화 여부
   */
  coordinateSystemVisible?: boolean;
}

export function HyperGlobe({ size = 600, coordinateSystemVisible }: HyperGlobeProps) {
  return (
    <Canvas style={{ height: size }} camera={{ position: [0, 0, 3] }}>
      {/* 기본 조명 설정 */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* 마우스로 카메라 조작 가능하게 하는 컨트롤 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
      />

      <Globe />

      {/* 좌표축 시각화 헬퍼들 */}
      {coordinateSystemVisible && <CoordinateSystem />}
    </Canvas>
  );
}
