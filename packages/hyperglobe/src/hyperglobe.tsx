import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Globe } from './components';
import { CoordinateSystem } from './debug';

export interface HyperGlobeProps {
  style?: React.CSSProperties;
  coordinateSystemVisible?: boolean;
}

export function HyperGlobe({ style, coordinateSystemVisible }: HyperGlobeProps) {
  return (
    <Canvas style={style} camera={{ position: [0, 0, 3] }}>
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
