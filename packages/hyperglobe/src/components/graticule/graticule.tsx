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
 * 격자무늬(Graticule) 컴포넌트
 *
 * - 경선과 위선으로 이루어진 격자무늬를 지구본에 추가합니다.
 * - 본초자오선(Prime Meridian)과 적도(Equator)는 별도의 색상과 두께로 설정할 수 있습니다.
 * - 경선과 위선의 간격은 longitudeStep과 latitudeStep 속성으로 조절할 수 있습니다.
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
