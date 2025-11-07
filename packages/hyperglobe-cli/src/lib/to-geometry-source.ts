import { FeaturePolygons, GeometrySource } from '@hyperglobe/interfaces';
import { MathConstants, roundCoordinates, triangulatePolygon } from '@hyperglobe/math';

/**
 * 하나의 피쳐의 폴리곤 정보를 메쉬 소스로 변환합니다.
 *
 * @param featurePolygons 단일 피쳐의 폴리곤 정보
 */
export function toGeometrySource(featurePolygons: FeaturePolygons[]): GeometrySource[] {
  const gridSpacing = 3;
  const densifyBoundary = true;
  const fillZIndex = MathConstants.FEATURE_FILL_Z_INDEX;
  const geometrySources: GeometrySource[] = [];

  for (const polygon of featurePolygons) {
    // Delaunay 삼각분할
    const { vertices, indices } = triangulatePolygon({
      coordinates: polygon,
      radius: fillZIndex,
      gridSpacing,
      densifyBoundary,
    });

    const flatVertices = vertices.flatMap((v) => [v[0], v[1], v[2]]);

    geometrySources.push({
      v: flatVertices.map(roundCoordinates),
      i: indices.map(roundCoordinates),
    });
  }

  return geometrySources;
}
