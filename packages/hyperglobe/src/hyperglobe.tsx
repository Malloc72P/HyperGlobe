import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export interface HyperGlobeProps {
  style?: React.CSSProperties;
}

export function HyperGlobe({ style }: HyperGlobeProps) {
  return (
    <Canvas style={style} camera={{ position: [0, 0, 5] }}>
      {/* 기본 조명 설정 */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* 마우스로 카메라 조작 가능하게 하는 컨트롤 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
      />

      <Globe />

      {/* 세그먼트 비교를 위한 추가 구체들 */}
      <Globe position={[-3, 0, 0]} segments={[8, 6]} label="Low (8x6)" />
      <Globe position={[0, 0, 0]} segments={[16, 12]} label="Medium (16x12)" />
      <Globe position={[3, 0, 0]} segments={[32, 24]} label="High (32x24)" />
    </Canvas>
  );
}

export interface GlobeProps {
  /**
   * 구체의 위치 (x, y, z)
   */
  position?: [number, number, number];
  /**
   * 구체의 세그먼트 수 (가로 세그먼트, 세로 세그먼트)
   */
  segments?: [number, number];
  /**
   * 구체의 라벨 (디버깅용)
   */
  label?: string;
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
export function Globe({ position = [0, 0, 0], segments = [32, 16], label }: GlobeProps) {
  return (
    <mesh position={position}>
      {/* 구체 지오메트리: 반지름 1, 가로 세그먼트, 세로 세그먼트 */}
      <sphereGeometry args={[1, segments[0], segments[1]]} />
      {/* 와이어프레임 모드로 세그먼트 구조 확인 */}
      <meshStandardMaterial color="#4A90E2" wireframe={false} />
    </mesh>
  );
}
