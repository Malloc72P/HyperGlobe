import { LineFeature } from '../line-feature';
import { LineFeature2 } from '../line-feature2';
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
}

export function Graticule({ longitudeStep = 10, latitudeStep = 10 }: GraticuleProps) {
  return (
    <group>
      {Array.from({ length: 180 / latitudeStep }).map((_, i) => {
        return <GraticuleLine key={`lat-${i}`} y={0} rotateX={90} />;
      })}
    </group>
  );
}
