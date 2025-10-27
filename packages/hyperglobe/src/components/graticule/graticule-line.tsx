import { Line } from '@react-three/drei';
import { LineFeature } from '../line-feature';
import { LineFeature2 } from '../line-feature2';
import type { Vector3 } from 'three';
import { toRadian } from '../../lib';

export interface GraticuleLineProps {
  rotateY?: number;
  rotateX?: number;
  y?: number;
}

export function GraticuleLine({ y = 0, rotateX = 0, rotateY = 0 }: GraticuleLineProps) {
  const points = Array.from({ length: 65 }, (_, i) => {
    const angle = (i / 64) * Math.PI * 2;
    const radius = Math.sqrt(1 - y * y);

    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0] as const;
  });

  return (
    <Line
      position={[0, y, 0]}
      rotation={[toRadian(rotateX), toRadian(rotateY), 0]}
      points={points}
      color="yellow"
      lineWidth={3}
    />
  );
}
