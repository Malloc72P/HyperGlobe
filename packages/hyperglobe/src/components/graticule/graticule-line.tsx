import { Line } from '@react-three/drei';

export interface GraticuleLineProps {
  rotateY?: number;
  rotateX?: number;
  y?: number;
  color?: string;
  lineWidth?: number;
}

export function GraticuleLine({
  y = 0,
  rotateX = 0,
  rotateY = 0,
  color = 'yellow',
  lineWidth = 3,
}: GraticuleLineProps) {
  const points = Array.from({ length: 91 }, (_, i) => {
    const angle = (i / 90) * Math.PI * 2;
    const radius = Math.sqrt(1 - y * y) + 0.0006;

    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0] as const;
  });

  // 위도 y가 1 또는 -1인 경우(극점)에는 그리드 라인을 그리지 않음
  if (Math.abs(y) === 1) {
    return null;
  }

  return (
    <Line
      position={[0, y, 0]}
      rotation={[rotateX, rotateY, 0]}
      points={points}
      color={color}
      lineWidth={lineWidth}
    />
  );
}
