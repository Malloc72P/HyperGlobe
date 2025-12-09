import { toRadian } from '../../../../hyperglobe-tools/src';
import { GraticuleLine } from './graticule-line';

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
 */
export function Graticule({
  longitudeStep = 10,
  latitudeStep = 10,
  lineColor = '#808080',
  lineWidth = 1.2,
}: GraticuleProps) {
  return (
    <group>
      {/* 위선 */}
      {Array.from({ length: 90 / latitudeStep }).map((_, i) => {
        const currentLat = Math.floor(i * latitudeStep);
        const y = Math.sin(toRadian(currentLat));

        return (
          <group key={`graticule-lat-${i}`}>
            <GraticuleLine y={y} rotateX={toRadian(90)} color={lineColor} lineWidth={lineWidth} />
            <GraticuleLine y={-y} rotateX={toRadian(90)} color={lineColor} lineWidth={lineWidth} />
          </group>
        );
      })}

      {/* 경선 */}
      {Array.from({ length: 180 / longitudeStep }).map((_, i) => {
        const currentLongitude = Math.floor(i * longitudeStep);

        return (
          <group key={`graticule-lon-${i}`}>
            <GraticuleLine
              rotateY={toRadian(currentLongitude)}
              color={lineColor}
              lineWidth={lineWidth}
            />
          </group>
        );
      })}
    </group>
  );
}
