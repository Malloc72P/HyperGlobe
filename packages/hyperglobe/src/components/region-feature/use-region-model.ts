import type {
  HGMFeature,
  RegionModel,
  VectorCoordinate,
  FeaturePolygons,
} from '@hyperglobe/interfaces';
import { OrthographicProj, MathConstants } from '@hyperglobe/tools';
import { useEffect, useMemo, useState } from 'react';
import { useMainStore } from 'src/store/main-store';

export interface UseRegionModelProps<DATA_TYPE = any> {
  feature: HGMFeature;
  data?: DATA_TYPE;
}

/**
 * HGM Feature를 기반으로 리전 모델을 생성하고 저장소에 삽입합니다.
 */
export function useRegionModel<DATA_TYPE = any>({ feature, data }: UseRegionModelProps<DATA_TYPE>) {
  const findRegionModelById = useMainStore((s) => s.findRegionModelById);
  const insertRegionModel = useMainStore((s) => s.insertRegionModel);
  const removeRegionModel = useMainStore((s) => s.removeRegionModel);

  const [region, setRegion] = useState<RegionModel<DATA_TYPE>>();

  useEffect(() => {
    const model = toReionModel<DATA_TYPE>(
      findRegionModelById,
      feature,
      removeRegionModel,
      insertRegionModel
    );

    setRegion(model);

    return () => {
      if (region) {
        removeRegionModel(region);
      }
    };
  }, [feature]);

  useEffect(() => {
    if (!region) {
      return;
    }

    const foundRegion = findRegionModelById(region.id);

    // rTree에 있는 오래된 모델 제거
    if (foundRegion) {
      removeRegionModel(foundRegion);
    }

    // 데이터가 변경된 새로운 모델 생성
    const nextRegion: RegionModel<DATA_TYPE> = {
      ...region,
      data,
    };

    // 상태 및 rTree에 업데이트된 모델 삽입
    setRegion(nextRegion);
    insertRegionModel(nextRegion);

    // React는 참조 동등성으로 의존성 배열을 비교한다. 따라서 region객체를 직접 넣으면 무한루프가 발생할 수 있다.
    // 그래서 region.id와 같은 원시 타입을 사용한다.
    // 해당 이펙트는 data만 바꾸는거라, 원시데이터 region.id는 변하지 않는다. 그래서 무한루프에 빠지지 않는다.
  }, [data, region?.id]);

  return [region];
}

function toReionModel<DATA_TYPE = any>(
  findRegionModelById: (id: string) => RegionModel | null,
  feature: HGMFeature,
  removeRegionModel: (RegionModel: RegionModel) => void,
  insertRegionModel: (RegionModel: RegionModel) => void
): RegionModel<DATA_TYPE> | (() => RegionModel<DATA_TYPE>) {
  return () => {
    const alreadyExistModel = findRegionModelById(feature.id);

    // 이미 존재하면 제거하고 재등록
    if (alreadyExistModel) {
      removeRegionModel(alreadyExistModel);
    }

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
      properties: feature.properties,
      ...feature.bbox,
    };

    insertRegionModel(newModel);
    return newModel;
  };
}
