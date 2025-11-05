import { create } from 'zustand';
import type { Coordinate2D } from '../types/tooltip';
import type { PointerEvent, RefObject } from 'react';
import type { RegionModel } from '../types/region';

export interface UpdateTooltipPositionFnParam {
  /**
   * 툴팁을 표시할 좌표
   */
  point: Coordinate2D;
  /**
   * 툴팁의 너비
   */
  tooltipWidth: number;
  /**
   * 툴팁의 높이
   */
  tooltipHeight: number;
}
export type UpdateTooltipPositionFn = (param: UpdateTooltipPositionFnParam) => Coordinate2D | null;

export interface MainStore {
  hoveredRegion: RegionModel | null;
  tooltipRef: RefObject<HTMLDivElement | null> | null;
  getTooltipPosition: UpdateTooltipPositionFn | null;
  registerTooltipRef: (ref: RefObject<HTMLDivElement | null>) => void;
  registerGetTooltipPosition: (fn: UpdateTooltipPositionFn) => void;
  setHoveredRegion: (regionModel: RegionModel | null) => void;
}

export const useMainStore = create<MainStore>()((set, get) => ({
  hoveredRegion: null,
  tooltipRef: null,
  getTooltipPosition: null,
  registerGetTooltipPosition: (fn) => set({ getTooltipPosition: fn }),
  registerTooltipRef: (ref) => set({ tooltipRef: ref }),
  setHoveredRegion: (regionModel) => set({ hoveredRegion: regionModel }),
}));
