import type {
  HGMFeature,
  RegionModel,
  VectorCoordinate,
  FeaturePolygons,
} from '@hyperglobe/interfaces';
import { OrthographicProj, MathConstants } from '@hyperglobe/tools';
import { useMemo } from 'react';
import { useMainStore } from 'src/store/main-store';

export interface UseRegionModelProps {
  feature: HGMFeature;
}

/**
 * HGM Feature를 기반으로 리전 모델을 생성하고 저장소에 삽입합니다.
 */
export function UseRegionModel({ feature }: UseRegionModelProps) {
  const insertRegionModel = useMainStore((s) => s.insertRegionModel);

  const regionModel = useMemo<RegionModel>(() => {
    const width = Math.abs(feature.bbox.maxX - feature.bbox.minX);
    const height = Math.abs(feature.bbox.maxY - feature.bbox.minY);
    const newModel: RegionModel = {
      id: feature.id,
      name: feature.properties.name || '',
      polygons: feature.borderLines.pointArrays.map((typedArr) =>
        Array.from(typedArr).reduce((acc, curr, i, array) => {
          if (i % 3 !== 0 || i + 2 >= array.length) return acc;

          const vector: VectorCoordinate = [curr, array[i + 1], array[i + 2]];
          const coordinate = OrthographicProj.unproject(
            vector,
            MathConstants.FEATURE_STROKE_Z_INDEX
          );

          acc.push(coordinate);

          return acc;
        }, [] as FeaturePolygons)
      ),
      bboxSize: width * height,
      ...feature.bbox,
    };

    insertRegionModel(newModel);

    return newModel;
  }, [feature]);

  return [regionModel];
}
