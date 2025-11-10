import { FeaturePolygons } from '@hyperglobe/interfaces';

/**
 * GeoJSON 피쳐를 FeaturePolygons 형식으로 변환합니다.
 *
 * - 폴리곤정보를 일반화된 객체로 변환하여 이후 처리에 용이하도록 합니다.
 * - 싱글폴리곤인 경우, 원소가 하나인 배열을 반환합니다.
 * - 멀티폴리곤인 경우, 각 폴리곤을 원소로 하는 배열을 반환합니다.
 */
export function toFeaturePolygons(feature: any): FeaturePolygons[] {
  // 멀티, 싱글 폴리곤 전부 처리할 수 있어야 함.
  const featurePolygons: FeaturePolygons[] = [];

  if (feature.geometry.coordinates.length === 0) return featurePolygons;

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

  return featurePolygons;
}
