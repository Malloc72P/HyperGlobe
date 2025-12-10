import { RawHGMFeature, SimpleFeature } from '@hyperglobe/interfaces';
import { toBorderlineSource } from './to-borderline-source';
import { toGeometrySource } from './to-geometry-source';

/**
 * SimpleFeature 객체를 HGM 포맷의 피쳐 객체로 변환합니다.
 *
 * SimpleFeature는 GeoJSON 피쳐를 단순화한 객체로, 실제 GeoJSON의 피쳐와 다르니 주의해야 합니다.
 */
export function toHgmFeature(feature: SimpleFeature): RawHGMFeature {
  const hgmFeatures: RawHGMFeature = {
    id: feature.id,
    // properties. 리젼의 속성 정보
    p: feature.properties,
    // geometrySource. 이걸로 리젼의 윗면을 그린다
    g: toGeometrySource(feature.polygons),
    // borderlineSource. 이걸로 리젼의 외곽선과 extrusion을 그린다
    l: toBorderlineSource(feature.polygons),
    // bounding box. Hit test 등에 사용된다
    b: feature.bbox,
  };

  return hgmFeatures;
}
