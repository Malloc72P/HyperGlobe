import { Line } from '@react-three/drei';
import { useMergedGraticuleGeometry } from './use-merged-graticule-geometry';

export interface GraticuleProps {
  /**
   * 경선 간격
   */
  longitudeStep?: number;
  /**
   * 위선 간격
   */
  latitudeStep?: number;
  /**
   * 일반 격자선 색상
   */
  lineColor?: string;
  /**
   * 일반 격자선 두께
   */
  lineWidth?: number;
}

/**
 * 지구본 위에 경위선 격자를 표시하는 컴포넌트입니다.
 *
 * - 경선(세로선)과 위선(가로선)으로 구성된 격자무늬
 * - 간격, 색상, 두께 커스터마이징 가능
 *
 * 주로 `HyperGlobe` 컴포넌트의 `graticule` prop을 통해 사용합니다.
 *
 * ### 최적화
 * - 모든 경위선을 하나의 Line으로 병합하여 드로우콜 최소화
 * - 기존: 54개 Line 객체 → 최적화 후: 1개 Line 객체
 */
export function Graticule({
  longitudeStep = 10,
  latitudeStep = 10,
  lineColor = '#808080',
  lineWidth = 1.2,
}: GraticuleProps) {
  const points = useMergedGraticuleGeometry({
    longitudeStep,
    latitudeStep,
  });

  return <Line points={points} segments color={lineColor} lineWidth={lineWidth} />;
}
