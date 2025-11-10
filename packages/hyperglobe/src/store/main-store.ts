import { create } from 'zustand';
import type { PointerEvent, RefObject } from 'react';
import type { Coordinate, RegionModel } from '@hyperglobe/interfaces';
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
  /**
   * Mutations
   */
  // 툴팁 ref 등록
  registerTooltipRef: (ref: RefObject<HTMLDivElement | null>) => void;
  // 리젼피쳐 호버링 설정
  setHoveredRegion: (regionModel: RegionModel | null) => void;
  // 리젼 BBox 등록
  insertRegionModel: (RegionModel: RegionModel) => void;
  // 리젼 BBox 제거
  removeRegionModel: (RegionModel: RegionModel) => void;
  // R-Tree 초기화
  clearRTree: () => void;
}

export const useMainStore = create<MainStore>()((set, get) => ({
  hoveredRegion: null,
  tooltipRef: null,
  getTooltipPosition: null,
  tree: new RBush<RegionModel>(),
  registerTooltipRef: (ref) => set({ tooltipRef: ref }),
  setHoveredRegion: (regionModel) => set({ hoveredRegion: regionModel }),
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
}));
