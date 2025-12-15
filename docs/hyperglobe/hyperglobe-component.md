# HyperGlobe 컴포넌트

## 개요

WebGL 기반 3D 지구본을 렌더링하는 루트 컴포넌트입니다. Three.js와 React Three Fiber 기반으로 구현되었으며, Props 기반 설정 방식을 사용합니다.

**파일**: `packages/hyperglobe/src/components/hyperglobe/hyperglobe.tsx`

**사용 예시**: Storybook의 `HyperGlobe` 스토리 참조

### 주요 기능

- 3D 지구본 렌더링 (WebGL)
- HGM 파일 자동 로딩 및 파싱
- Region, Route, Marker 피처 렌더링
- 경위선 격자 (Graticule)
- 컬러스케일 데이터 시각화
- 카메라 컨트롤 및 트랜지션
- 툴팁, 로딩 UI, FPS 카운터

## Props

**타입 정의**: `packages/hyperglobe/src/types/hyperglobe-props.ts`

### 주요 Props

| 카테고리 | Props | 설명 |
|---------|-------|------|
| **필수** | `hgmUrl` | HGM 파일 URL |
| **컨테이너** | `id`, `size`, `maxSize`, `style` | Canvas 설정 |
| **Globe** | `globe` | 구체 스타일, 와이어프레임 |
| **Camera** | `camera` | 초기 위치, 거리 제한 |
| **Controls** | `controls` | 줌, 회전, 팬 활성화 |
| **피처** | `region`, `routes`, `markers`, `graticule` | 렌더링할 피처들 |
| **데이터** | `dataMap`, `colorscale`, `colorscaleBar` | 데이터 시각화 |
| **UI** | `tooltip`, `showFpsCounter`, `showLoadingUI` | UI 옵션 |
| **Lazy Load** | `lazyLoad`, `lazyLoadThreshold` | 지연 로딩 |
| **이벤트** | `onReady`, `onHoverChanged` | 콜백 함수 |

> **상세 Props**: 각 피처별 상세 설정은 타입 정의 파일 또는 Storybook 참조

### 피처별 상세 문서

- **Region**: [RegionFeatureCollection](./region-feature-collection.md)
- **Graticule**: [Graticule](./graticule.md)
- **Routes**: [RouteFeature](./route-feature.md)
- **Markers**: [MarkerFeature](./marker-feature.md)
- **ColorScale**: [ColorScale 시스템](./colorscale.md)

## 동작 원리

### 렌더링 파이프라인

1. `hgmUrl`로 HGM 파일 fetch
2. `useHGM` 훅으로 HGM 파싱
3. React Three Fiber `Canvas`에서 WebGL 렌더링
4. `RegionFeatureCollection`으로 지역 피처 렌더링 (지오메트리 병합 최적화)
5. 기타 피처 (Graticule, Routes, Markers) 렌더링
6. `onReady` 콜백 호출

### 주요 특징

- **색상 공간**: NoToneMapping (정확한 색상 재현)
- **상태 관리**: Zustand 기반 메인 스토어 (툴팁, 호버, R-Tree)
- **지연 로딩**: Intersection Observer 기반 lazy load 지원
- **카메라 제어**: OrbitControls + 명령형 트랜지션 API

## 관련 문서

- [RegionFeatureCollection](./region-feature-collection.md) - 지역 피쳐 렌더링
- [Graticule](./graticule.md) - 경위선 격자
- [RouteFeature](./route-feature.md) - 라우트 피쳐
- [MarkerFeature](./marker-feature.md) - 마커 피쳐
- [ColorScale 시스템](./colorscale.md) - 데이터 시각화
- [카메라 트랜지션](./camera-transition.md) - 명령형 카메라 API
- [메인 스토어](./main-store.md) - 상태 관리
