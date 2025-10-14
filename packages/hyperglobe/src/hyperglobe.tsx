import { Canvas } from '@react-three/fiber';

export interface HyperGlobeProps {
  style?: React.CSSProperties;
}

export function HyperGlobe({ style }: HyperGlobeProps) {
  return (
    <Canvas style={style}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <VisualObject />
    </Canvas>
  );
}

export function VisualObject() {
  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial color="purple" />
    </mesh>
  );
}
