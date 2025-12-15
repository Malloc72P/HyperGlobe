import { create, createStore, useStore } from 'zustand';
import { createContext, useContext, type PointerEvent, type RefObject } from 'react';
import type { Coordinate, RegionModel } from '@hyperglobe/interfaces';
import type { StoreApi } from 'zustand';
import RBush from 'rbush';

export interface UpdateTooltipPositionFnParam {
  /**
   * 툴팁을 표시할 좌표
   */
  point: Coordinate;
  tooltipElement: HTMLDivElement;
}
export type UpdateTooltipPositionFn = (param: UpdateTooltipPositionFnParam) => Coordinate | null;

export interface MainStore {
  /**
   * State
   */
  // 호버된 리젼의 모델
  hoveredRegion: RegionModel | null;
  // 툴팁 ref
  tooltipRef: RefObject<HTMLDivElement | null> | null;
  // 툴팁 위치를 계산하는 함수
  getTooltipPosition: UpdateTooltipPositionFn | null;
  // R-Tree
  tree: RBush<RegionModel>;
  loading: boolean;
  regionLoading: boolean;
  /**
   * Mutations
   */
  setLoading: (loading: boolean) => void;
  setRegionLoading: (loading: boolean) => void;
  init: () => void;
  // 툴팁 ref 등록
  registerTooltipRef: (ref: RefObject<HTMLDivElement | null>) => void;
  // 리젼피쳐 호버링 설정
  setHoveredRegion: (regionModel: RegionModel | null) => void;
  // ID로 리젼 모델 찾기
  findRegionModelById: (id: string) => RegionModel | null;
  // 리젼 BBox 등록
  insertRegionModel: (RegionModel: RegionModel) => void;
  // 리젼 BBox 제거
  removeRegionModel: (RegionModel: RegionModel) => void;
  // R-Tree 초기화
  clearRTree: () => void;
  // MainStore 정리
  clean: () => void;
}

export const createMainStore = (): StoreApi<MainStore> => {
  return createStore<MainStore>((set, get) => ({
    hoveredRegion: null,
    tooltipRef: null,
    getTooltipPosition: null,
    tree: new RBush<RegionModel>(),
    loading: true,
    regionLoading: false,
    setLoading: (loading: boolean) => set({ loading }),
    setRegionLoading: (loading: boolean) => set({ regionLoading: loading }),
    init: () => {
      const { tree, clearRTree } = get();

      if (tree) {
        clearRTree();
      }
    },
    registerTooltipRef: (ref) => set({ tooltipRef: ref }),
    setHoveredRegion: (regionModel) => set({ hoveredRegion: regionModel }),
    findRegionModelById: (id) => {
      const { tree } = get();

      return tree.all().find((region) => region.id === id) || null;
    },
    insertRegionModel: (bbox) => {
      const tree = get().tree;

      tree.insert(bbox);
    },
    removeRegionModel: (bbox: RegionModel) => {
      get().tree.remove(bbox);
    },
    clearRTree: () => {
      get().tree.clear();
    },
    clean: () => {
      const { clearRTree } = get();

      clearRTree();
    },
  }));
};

export const MainStoreContext = createContext<StoreApi<MainStore> | null>(null);

export function useMainStore<T>(selector: (state: MainStore) => T): T {
  const store = useContext(MainStoreContext);

  if (!store) {
    throw new Error('MainStoreProvider 내부에서만 useMainStore를 사용할 수 있습니다.');
  }

  return useStore(store, selector);
}
