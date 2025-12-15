# RegionFeatureCollection 컴포넌트

## 개요

여러 지역(국가, 행정구역 등)을 **하나의 병합된 지오메트리**로 렌더링하는 최적화된 컴포넌트입니다.

**파일**: `packages/hyperglobe/src/components/region-feature-collection/region-feature-collection.tsx`

**사용 예시**: Storybook의 `RegionFeatureCollection` 스토리 참조

### 성능 비교

| 항목 | 개별 메시 방식 | RegionFeatureCollection |
|------|--------------|------------------------|
| 드로우콜 (200개 국가) | ~600 | ~6 |
| 국가별 색상 | ❌ 개별 메시 필요 | ✅ Vertex Color |
| ColorScale 지원 | ✅ | ✅ |
| 호버 지원 | ✅ | ✅ (오버레이 방식) |

## 사용법

`HyperGlobe` 컴포넌트의 `region` prop 사용:

```tsx
<HyperGlobe
  hgmUrl="/maps/nations-mid.hgm"
  dataMap={{ gdp: { KOR: 1800000, JPN: 4900000 } }}
  region={{
    dataKey: 'gdp',
    idField: 'ISO_A3',
    style: { fillColor: '#3b82f6' },
    hoverStyle: { fillColor: '#60a5fa' },
  }}
  colorscale={{ model: colorscale }}
/>
```

## 주요 기능

### 지오메트리 병합
- 모든 지역의 상단면/측면/외곽선을 각각 하나의 `BufferGeometry`로 병합
- 드로우콜 최소화: 국가별 개별 메시 → 3개의 병합된 메시

### Vertex Color
- 국가별 색상을 위해 **Vertex Color** 사용
- 각 국가의 모든 정점에 동일 색상 할당 → 단색 면
- ColorScale 연동 가능

### 호버 오버레이
- 호버된 국가만 별도 지오메트리로 동적 생성
- `polygonOffset`으로 Z-fighting 방지

## Props

**타입 정의**: `packages/hyperglobe/src/types/hyperglobe-props.ts` (`RegionConfig`)

| Prop | 타입 | 설명 |
|------|------|------|
| `dataKey` | `string` | dataMap에서 사용할 데이터 키 |
| `idField` | `string` | 피처 ID로 사용할 속성명 (미설정 시 `feature.id`) |
| `style` | `FeatureStyle` | 기본 스타일 |
| `hoverStyle` | `FeatureStyle` | 호버 스타일 |
| `extrusion` | `{ color?: string }` | 측면 옵션 |
| `extrusion` | `{ color?: string }` | `{ color: Colors.GRAY[8] }` | 측면 옵션 |

## 구현 원리

### 1. 지오메트리 병합

```
개별 메시: 국가1 + 국가2 + ... + 국가N = N 드로우콜
병합 메시: 상단 1개 + 측면 1개 + 외곽선 1개 = 3 드로우콜
```

### 2. Vertex Color 방식

하나의 메시에서 국가별 색상 표현:
- 각 정점에 RGB 색상 할당
- 같은 국가의 모든 정점 = 동일 색상 → 단색 면
- GPU가 정점 간 색상 보간

### 3. 호버 오버레이

1. R-Tree에서 마우스 위치의 국가 탐색
2. 해당 국가 지오메트리 동적 생성
3. `polygonOffset`으로 기존 메시 위에 렌더링

### 스타일 우선순위

1. 기본 스타일
2. 사용자 지정 스타일 (`style` prop)
3. ColorScale 색상
4. 호버 스타일 (ColorScale 호버 색상 포함)

### 색상 적용 범위

| 요소 | 국가별 색상 |
|------|-----------|
| 상단면 | ✅ Vertex Color |
| 측면 | ❌ 단일 색상 |
| 외곽선 | ❌ 단일 색상 |

## 내부 구조

### 관련 파일

- `region-feature-collection.tsx`: 메인 컴포넌트
- `use-merged-geometry.ts`: 지오메트리 병합 및 Vertex Color
- `use-batch-region-models.ts`: R-Tree 배치 등록
- `hovered-region-overlay.tsx`: 호버 오버레이

### 사용 라이브러리

- Three.js: `BufferGeometry`, `mergeGeometries`
- @react-three/drei: `Line`
- RBush: R-Tree 공간 인덱싱

## 제약사항

- 폴리곤/멀티폴리곤만 지원
- HGM 포맷 필요
- 외곽선/측면은 전체 동일 색상만 가능

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [ColorScale 시스템](./colorscale.md)
- [메인 스토어](./main-store.md)
