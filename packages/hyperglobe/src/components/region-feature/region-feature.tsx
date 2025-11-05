import { useMemo, useState } from 'react';
import { UiConstant } from '../../constants';
import { useFeatureStyle } from '../../hooks/use-feature-style';
import type { FeatureStyle } from '../../types/feature';
import type { FeaturePolygons } from '../../types/polygon';
import { PolygonFeature } from '../polygon-feature/polygon-feature';
import type { RegionModel } from '../../types/region';
import { useMainStore } from '../../store';

export interface RegionFeatureProps {
  /**
   * 지역의 피쳐 정보(GeoJson 형식).
   *
   * - 폴리곤, 멀티폴리곤 형식의 지오메트리만 지원합니다.
   */
  feature: any;

  /**
   * 지역 스타일
   */
  style?: FeatureStyle;

  /**
   * 지역이 호버되었을때의 스타일
   */
  hoverStyle?: FeatureStyle;

  /**
   * wireframe 모드 여부
   */
  wireframe?: boolean;

  /**
   * 재질의 거칠기
   *
   * - 값이 클수록 표면이 거칠어집니다.
   * - 0은 매끄러운 표면, 1은 매우 거친 표면을 의미합니다.
   * - 범위: 0 ~ 1
   */
  roughness?: number;

  /**
   * 재질의 금속성
   *
   * - 값이 클수록 금속성 효과가 강해집니다.
   * - 0은 비금속성, 1은 완전한 금속성을 의미합니다.
   * - 범위: 0 ~ 1
   */
  metalness?: number;
}

/**
 * 리전 피쳐 컴포넌트.
 *
 * - GeoJSON 형식의 피쳐 데이터를 받아 다각형을 그립니다.
 * - 멀티폴리곤과 싱글폴리곤을 모두 지원합니다.
 */
export function RegionFeature({
  feature,
  style = UiConstant.polygonFeature.default.style,
  hoverStyle = UiConstant.polygonFeature.default.hoverStyle,
  ...polygonFeatureProps
}: RegionFeatureProps) {
  const [hovered, setHovered] = useState(false);
  const [appliedStyle] = useFeatureStyle({ hovered, style, hoverStyle });
  const regionModel = useMemo<RegionModel>(() => {
    return {
      id: feature.id,
      name: feature.properties.name || '',
    };
  }, [feature]);
  const setHoveredRegion = useMainStore((s) => s.setHoveredRegion);

  const featurePolygons = useMemo(() => {
    // 멀티, 싱글 폴리곤 전부 처리할 수 있어야 함.
    const _featurePolygons: FeaturePolygons[] = [];

    if (feature.geometry.coordinates.length === 0) return;

    if (feature.geometry.type === 'Polygon') {
      // 첫번째는 경계정보 폴리곤. 그 다음부터는 구멍(holes) 정보 폴리곤
      const borderlinePolygon = feature.geometry.coordinates[0];

      _featurePolygons.push(borderlinePolygon as FeaturePolygons);
    } else {
      for (const singlePolygon of feature.geometry.coordinates) {
        // 첫번째는 경계정보 폴리곤. 그 다음부터는 구멍(holes) 정보 폴리곤
        const borderlinePolygon = singlePolygon[0];

        _featurePolygons.push(borderlinePolygon as FeaturePolygons);
      }
    }

    return _featurePolygons;
  }, []);

  if (!featurePolygons) return;

  return (
    <group
      onPointerEnter={(e) => {
        e.stopPropagation();

        setHovered(true);
        setHoveredRegion(regionModel);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();

        setHovered(false);
        setHoveredRegion(null);
      }}
    >
      {featurePolygons.map((polygon, i) => (
        <PolygonFeature key={i} polygons={polygon} style={appliedStyle} {...polygonFeatureProps} />
      ))}
    </group>
  );
}
