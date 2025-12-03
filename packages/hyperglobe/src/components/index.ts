// 메인 컴포넌트 (새 API)
export * from './hyperglobe';

// 타입 export (새 API에서 사용)
export type { GlobeStyle } from './hyperglobe/globe';

// === 레거시 컴포넌트 (추후 제거 예정) ===
// 아래 컴포넌트들은 새 API에서 HyperGlobe props로 대체됩니다.
// 마이그레이션 완료 후 제거될 예정입니다.

/** @deprecated HyperGlobe의 region prop 사용 */
export * from './region-feature';
/** @deprecated HyperGlobe의 region prop 사용 */
export * from './region-feature-collection';
/** @deprecated 추후 HyperGlobe의 routes prop으로 대체 예정 */
export * from './route-feature';
/** @deprecated 추후 HyperGlobe의 markers prop으로 대체 예정 */
export * from './marker-feature';
/** @deprecated HyperGlobe의 graticule prop 사용 */
export * from './graticule';
/** @deprecated HyperGlobe의 colorscaleBar prop 사용 */
export * from './colorscale-bar';

// 유틸리티 컴포넌트
export * from './fps-counter';
