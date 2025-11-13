import type { RegionModel } from '@hyperglobe/interfaces';

export type OnHoverChangedFn = (param: { hoveredRegion?: RegionModel | null }) => void;
