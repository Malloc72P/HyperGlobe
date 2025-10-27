import type { Feature, MultiPolygon, Polygon } from 'geojson';
import { useMemo } from 'react';
import type { FeaturePolygons } from '../../types/polygon';
import { PolygonFeature } from '../polygon-feature/polygon-feature';

export interface RegionFeatureProps {
  /**
   * 지역의 피쳐 정보(GeoJson 형식).
   *
   * - 폴리곤, 멀티폴리곤 형식의 지오메트리만 지원합니다.
   */
  feature: Feature<Polygon | MultiPolygon>;

  /**
   * 선 색상
   */
  color?: string;

  /**
   * 선 두께
   */
  lineWidth?: number;

  /**
   * 면 채우기 활성화 여부
   */
  fill?: boolean;

  /**
   * 면 색상
   */
  fillColor?: string;

  /**
   * 면 투명도 (0~1)
   */
  fillOpacity?: number;

  /**
   * wireframe 모드 여부
   */
  wireframe?: boolean;
}

/**
 * 리전 피쳐 컴포넌트.
 *
 * - GeoJSON 형식의 피쳐 데이터를 받아 다각형을 그립니다.
 * - 멀티폴리곤과 싱글폴리곤을 모두 지원합니다.
 */
export function RegionFeature({
  feature,
  color = 'red',
  lineWidth = 2,
  fill = false,
  fillColor = 'red',
  fillOpacity = 0.3,
  wireframe = false,
}: RegionFeatureProps) {
  const memorized = useMemo(() => {
    // 멀티, 싱글 폴리곤 전부 처리할 수 있어야 함.
    const featurePolygons: FeaturePolygons[] = [];

    if (feature.geometry.coordinates.length === 0) return;

    if (feature.geometry.type === 'Polygon') {
      // 첫번째는 경계정보 폴리곤. 그 다음부터는 구멍(holes) 정보 폴리곤
      const borderlinePolygon = feature.geometry.coordinates[0];

      featurePolygons.push(borderlinePolygon as FeaturePolygons);
    } else {
      for (const singlePolygon of feature.geometry.coordinates) {
        // 첫번째는 경계정보 폴리곤. 그 다음부터는 구멍(holes) 정보 폴리곤
        const borderlinePolygon = singlePolygon[0];

        featurePolygons.push(borderlinePolygon as FeaturePolygons);
      }
    }

    return {
      featurePolygons,
    };
  }, []);

  if (!memorized) return;

  return (
    <group>
      {memorized.featurePolygons.map((polygon, i) => (
        <PolygonFeature
          key={i}
          polygons={polygon}
          color={color}
          lineWidth={lineWidth}
          fill={fill}
          fillColor={fillColor}
          fillOpacity={fillOpacity}
          wireframe={wireframe}
        />
      ))}
    </group>
  );
}
