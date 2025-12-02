import type {
  HGMFeature,
  RegionModel,
  FeaturePolygons,
  VectorCoordinate,
} from '@hyperglobe/interfaces';
import { OrthographicProj, MathConstants } from '@hyperglobe/tools';
import { useEffect, useRef } from 'react';
import { useMainStore } from '../../store/main-store';

export interface UseBatchRegionModelsOptions {
  /** R-Tree에 등록할 features 배열 */
  features: HGMFeature[];
}

/**
 * 여러 feature를 R-Tree에 배치로 등록하는 훅
 *
 * - 기존 useRegionModel은 개별 feature마다 호출되어 비효율적
 * - 이 훅은 모든 feature를 한 번에 등록/제거
 */
export function useBatchRegionModels({ features }: UseBatchRegionModelsOptions): void {
  const insertRegionModel = useMainStore((s) => s.insertRegionModel);
  const removeRegionModel = useMainStore((s) => s.removeRegionModel);
  const findRegionModelById = useMainStore((s) => s.findRegionModelById);

  // 등록된 모델들을 추적 (cleanup용)
  const registeredModelsRef = useRef<RegionModel[]>([]);

  useEffect(() => {
    if (!features || features.length === 0) return;

    const newModels: RegionModel[] = [];

    for (const feature of features) {
      // 이미 존재하면 제거
      const existingModel = findRegionModelById(feature.id);
      if (existingModel) {
        removeRegionModel(existingModel);
      }

      // RegionModel 생성
      const model = createRegionModel(feature);
      insertRegionModel(model);
      newModels.push(model);
    }

    registeredModelsRef.current = newModels;

    // Cleanup: 컴포넌트 언마운트 시 R-Tree에서 제거
    return () => {
      for (const model of registeredModelsRef.current) {
        removeRegionModel(model);
      }
      registeredModelsRef.current = [];
    };
  }, [features, insertRegionModel, removeRegionModel, findRegionModelById]);
}

/**
 * HGMFeature를 RegionModel로 변환
 */
function createRegionModel(feature: HGMFeature): RegionModel {
  const width = Math.abs(feature.bbox.maxX - feature.bbox.minX);
  const height = Math.abs(feature.bbox.maxY - feature.bbox.minY);

  const polygons = feature.borderLines.pointArrays.map((typedArr) =>
    Array.from(typedArr).reduce((acc, curr, i, array) => {
      if (i % 3 !== 0 || i + 2 >= array.length) return acc;

      const vector: VectorCoordinate = [curr, array[i + 1], array[i + 2]];
      const coordinate = OrthographicProj.unproject(vector, MathConstants.FEATURE_STROKE_Z_INDEX);

      acc.push(coordinate);

      return acc;
    }, [] as FeaturePolygons)
  );

  return {
    id: feature.id,
    name: feature.properties.name || '',
    polygons,
    bboxSize: width * height,
    properties: feature.properties,
    ...feature.bbox,
  };
}
