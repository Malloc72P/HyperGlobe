import { Text } from '@react-three/drei';

/**
 * 좌표축 시각화 컴포넌트의 props 인터페이스
 */
export interface CoordinateSystemProps {
  /**
   * 축의 길이
   */
  length?: number;
  /**
   * 축의 반지름
   */
  radius?: number;
}

/**
 * Three.js 좌표계를 시각적으로 보여주는 컴포넌트
 * @param param0
 * @returns
 */
export function CoordinateSystem({ length = 1.5, radius = 0.02 }: CoordinateSystemProps) {
  return (
    <>
      {/* X축: 빨간색 선 (오른쪽 방향) */}
      <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[radius, radius, length]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {/* Y축: 초록색 선 (위쪽 방향) */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[radius, radius, length]} />
        <meshBasicMaterial color="green" />
      </mesh>

      {/* Z축: 파란색 선 (앞쪽 방향, 카메라 쪽) */}
      <mesh position={[0, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, length]} />
        <meshBasicMaterial color="blue" />
      </mesh>

      {/* 각 축의 라벨 텍스트 (항상 카메라를 향함) */}
      <Text
        position={[length + 0.3, 0, 0]}
        fontSize={0.2}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        +X
      </Text>

      <Text
        position={[0, length + 0.3, 0]}
        fontSize={0.2}
        color="green"
        anchorX="center"
        anchorY="middle"
      >
        +Y
      </Text>

      <Text
        position={[0, 0, length + 0.3]}
        fontSize={0.2}
        color="blue"
        anchorX="center"
        anchorY="middle"
      >
        +Z
      </Text>
    </>
  );
}
