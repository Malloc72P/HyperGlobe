import { FeaturePolygons } from '@hyperglobe/interfaces';

/**
 * GeoJSON 피쳐를 FeaturePolygons 형식으로 변환합니다.
 */
export function toFeaturePolygons(feature: any) {
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
}
