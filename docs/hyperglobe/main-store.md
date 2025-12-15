# 메인 스토어 (MainStore)

## 개요

HyperGlobe의 전역 상태를 관리하는 Zustand 기반 스토어입니다. 호버 상태, 툴팁, R-Tree 공간 인덱싱 등을 중앙에서 관리합니다.

**파일**: `packages/hyperglobe/src/store/`

**특징**:
- Context Provider 패턴으로 각 HyperGlobe 인스턴스별 독립 스토어
- 여러 HyperGlobe 동시 사용 시 상태 충돌 없음

## 주요 상태

### hoveredRegion
현재 호버 중인 지역 모델 (`RegionModel | null`)

**사용처**: ColorScaleBar, Tooltip, RegionFeature

### loading
지도 데이터 로딩 상태 (`boolean`)

### tooltipRef
툴팁 DOM 요소 참조 (`RefObject<HTMLDivElement | null>`)

### tree
R-Tree 공간 인덱스 (RBush 인스턴스)

**용도**: 마우스 위치에서 효율적인 지역 검색

## 주요 액션

**타입 정의**: `packages/hyperglobe/src/store/main-store.ts`

| 액션 | 설명 |
|------|------|
| `setLoading` | 로딩 상태 설정 |
| `setHoveredRegion` | 호버 지역 설정 |
| `findRegionModelById` | ID로 지역 찾기 |
| `insertRegionModel` | R-Tree에 지역 추가 |
| `removeRegionModel` | R-Tree에서 지역 제거 |
| `clearRTree` | R-Tree 초기화 |
| `registerTooltipRef` | 툴팁 참조 등록 |
| `init` / `clean` | 스토어 초기화/정리 |

## 사용 예시

```typescript
import { useMainStore } from 'src/store';

// 상태 구독 (성능 최적화를 위해 필요한 것만)
const hoveredRegion = useMainStore((s) => s.hoveredRegion);
const setHoveredRegion = useMainStore((s) => s.setHoveredRegion);
```

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RegionFeatureCollection](./region-feature-collection.md)
## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RegionFeatureCollection](./region-feature-collection.md)
