# ColorScale 시스템

## 개요

ColorScale은 데이터 값에 따라 지역에 자동으로 색상을 적용하는 시스템입니다. `useColorScale` 훅으로 컬러스케일을 생성하고, `HyperGlobe`의 `colorscale`, `colorscaleBar` props를 통해 적용합니다.

## 구성 요소

### useColorScale 훅
데이터 기반 컬러스케일 모델을 생성합니다.

### colorscale prop
HyperGlobe에 컬러스케일 모델을 전달합니다.

### colorscaleBar prop
컬러스케일을 시각적으로 표시하는 범례 UI를 표시합니다.

## 사용법

```tsx
import { HyperGlobe, useColorScale } from 'hyperglobe';

function DataVisualization() {
  const { colorscale } = useColorScale({
    steps: [
      { to: 1000000, color: '#eff6ff', hoverColor: '#dbeafe' },
      { from: 1000000, to: 10000000, color: '#3b82f6', hoverColor: '#60a5fa' },
      { from: 10000000, color: '#1e40af', hoverColor: '#3b82f6' },
    ],
    nullColor: '#e5e7eb',
  });

  const gdpData = {
    KOR: 1800000,
    JPN: 4900000,
    USA: 25000000,
    // ...
  };

  return (
    <HyperGlobe
      hgmUrl="/maps/nations-mid.hgm"
      dataMap={{ gdp: gdpData }}
      region={{
        dataKey: 'gdp',
        idField: 'ISO_A3',
      }}
      colorscale={{ model: colorscale }}
      colorscaleBar={{
        position: 'bottom-right',
        formatLabel: (value) => `${(value / 1000000).toFixed(1)}M`,
      }}
    />
  );
}
```

## useColorScale 훅

### 기본 개념

**컬러스케일 구간(Step)**
- 값의 범위를 여러 구간으로 나누고, 각 구간에 색상 지정
- 구간은 `from` 이상, `to` 미만으로 정의됨
- 예: `[0, 100)`, `[100, 500)`, `[500, ∞)`

### Props

#### steps (필수)
컬러스케일 구간 배열

```typescript
interface ColorScaleStepOptions {
  label?: string;       // 구간 레이블
  from?: number;        // 하한 (포함, 생략 시 -∞)
  to?: number;          // 상한 (미포함, 생략 시 +∞)
  color?: string;       // 적용할 색상
  hoverColor?: string;  // 호버 시 적용할 색상
}
```

#### nullColor (선택)
값이 null인 경우 적용할 색상

```typescript
nullColor?: string;
```

#### data (선택)
원본 데이터 배열. 최솟값/최댓값 계산에 사용됩니다.

```typescript
data?: any[];
```

#### itemResolver (선택)
피쳐와 데이터 항목을 매칭하는 함수

```typescript
itemResolver?: (feature: HGMFeature, dataItem: any) => boolean;
// 기본값: (feature, item) => feature.id === item.id
```

#### valueResolver (선택)
데이터 항목에서 값을 추출하는 함수

```typescript
valueResolver?: (dataItem: any) => number | null | undefined;
// 기본값: (dataItem) => dataItem.value
```

### 반환값

#### colorscale
커러스케일 모델 (`ColorScaleModel`)
- HyperGlobe의 `colorscale.model`에 전달합니다.

#### resolveFeatureData
피쳐에 해당하는 데이터를 찾아 반환하는 함수

```typescript
resolveFeatureData: (feature: HGMFeature) => { value: number | null }
```

- `data` 배열에서 `itemResolver`로 매칭되는 항목을 찾습니다.
- 찾은 항목에서 `valueResolver`로 값을 추출합니다.
- 항목이 없으면 `{ value: null }`을 반환합니다.

## 사용 예시

### 기본 사용

```tsx
import { HyperGlobe, useColorScale } from 'hyperglobe';

function GDPMap() {
  const { colorscale } = useColorScale({
    steps: [
      { to: 20000, color: '#fee5d9' },
      { from: 20000, to: 40000, color: '#fcae91' },
      { from: 40000, to: 60000, color: '#fb6a4a' },
      { from: 60000, color: '#cb181d' },
    ],
  });

  const gdpData = {
    KOR: 50000,
    USA: 70000,
    JPN: 40000,
  };

  return (
    <HyperGlobe
      hgmUrl="/maps/nations-mid.hgm"
      dataMap={{ gdp: gdpData }}
      region={{ dataKey: 'gdp' }}
      colorscale={{ model: colorscale }}
    />
  );
}
```

### null 값 처리

```tsx
const { colorscale } = useColorScale({
  steps: [...],
  nullColor: '#e0e0e0',  // 데이터가 없는 국가는 회색
});
```

### 호버 색상 설정

```tsx
const { colorscale } = useColorScale({
  steps: [
    { 
      to: 1000000, 
      color: '#eff6ff',
      hoverColor: '#dbeafe',  // 호버 시 더 밝은 색상
    },
    { 
      from: 1000000, 
      color: '#3b82f6',
      hoverColor: '#60a5fa',
    },
  ],
});
```

## ColorscaleBar 설정

### ColorscaleConfig (HyperGlobe prop)

HyperGlobe의 `colorscale` prop에 전달하는 설정:

```typescript
interface ColorscaleConfig {
  /** 커러스케일 모델 (useColorScale으로 생성) */
  model: ColorScaleModel;

  /** dataMap에서 사용할 데이터 키 (region.dataKey와 동일하게 설정) */
  dataKey?: string;
}
```

### ColorscaleBarConfig (HyperGlobe prop)

### Props

```typescript
interface ColorscaleBarConfig {
  show?: boolean;           // 표시 여부 (기본: true)
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  title?: string;           // 제목
  style?: CSSProperties;    // 스타일
  formatLabel?: (value: number) => string;  // 레이블 포맷 함수
}
```

### 사용 예시

```tsx
// 기본 사용 (colorscaleBar={true}와 동일)
<HyperGlobe
  colorscale={{ model: colorscale }}
  colorscaleBar
/>

// 상세 설정
<HyperGlobe
  colorscale={{ model: colorscale }}
  colorscaleBar={{
    position: 'bottom-right',
    formatLabel: (value) => value.toLocaleString(),
  }}
/>

// 레이블 포맷팅
<HyperGlobe
  colorscale={{ model: colorscale }}
  colorscaleBar={{
    formatLabel: (value) => `${(value / 1000000).toFixed(1)}M`,
  }}
/>
```

## 파일 구조

### useColorScale 훅

```
src/hooks/
├── use-colorscale.ts           # 메인 훅 및 헬퍼 함수
├── use-colorscale.stories.tsx  # Storybook 스토리
├── use-colorscale-snippets.ts  # 코드 스니펫
└── colorscale-story.tsx        # 스토리용 컴포넌트
```

### ColorScaleBar 컴포넌트

```
src/components/colorscale-bar/
├── index.ts                    # export 정의
├── colorscale-bar.tsx          # 메인 컴포넌트
├── colorscale-bar.module.css   # 스타일
├── colorscale-step.tsx         # 개별 구간 컴포넌트
└── use-marker-position.ts      # 마커 위치 계산 훅
```

## 기술 세부사항

### 컬러스케일 모델 구조

```typescript
interface ColorScaleModel {
  nullColor?: string;            // 값이 null인 경우 적용될 색상
  steps: ColorScaleStepModel[];  // 컬러스케일 구간 목록
  minValue: number;              // 데이터 최솟값
  maxValue: number;              // 데이터 최댓값
}

interface ColorScaleStepModel {
  id: string;           // 구간 고유 ID
  stepTotal: number;    // 전체 구간 수
  index: number;        // 현재 구간 인덱스
  label: string;        // 구간 레이블
  from: number;         // 하한 (포함)
  to: number;           // 상한 (미포함)
  color?: string;       // 적용할 색상
  hoverColor?: string;  // 호버 색상
}
```

### 색상 적용 우선순위

1. **ColorScale 색상** (최우선)
2. `region.style` prop
3. 기본 스타일

컬러스케일이 설정되면, `region.style.fillColor`는 무시됩니다.

### 무한대 처리

구간의 `from`이나 `to`가 생략되면 무한대로 처리됩니다:
- `from` 생략 → `-Infinity`
- `to` 생략 → `+Infinity`

ColorScaleBar에서는 데이터의 실제 최솟값/최댓값으로 대체하여 표시합니다.

## 헬퍼 함수

useColorScale 훅에서 export되는 유틸리티 함수들:

```typescript
// 값에 해당하는 구간 찾기
findStepByValue(colorscale: ColorScaleModel, value: number): ColorScaleStepModel | null

// 값이 특정 구간에 속하는지 확인
isCurrentStep(step: ColorScaleStepModel, value: number): boolean

// 값에 따른 색상 반환
getColorScaleColor(colorscale: ColorScaleModel, value: number): string | undefined

// 값에 따른 호버 색상 반환
getColorScaleHoverColor(colorscale: ColorScaleModel, value: number): string | undefined
```

## 사용된 수학 라이브러리

#### @hyperglobe/tools
- `isSafeNumber(value)`: 안전한 숫자 여부 확인 (NaN, Infinity 제외)
- `resolveNumber(value, fallback)`: 유효하지 않은 숫자는 fallback으로 대체

## 모범 사례

### 구간 설정
- 구간은 연속적이어야 함 (빈틈 없이)
- 첫 구간의 `from`과 마지막 구간의 `to`는 생략하는 것이 좋음
- 구간 수는 5-7개가 적절함 (너무 많으면 구분 어려움)

### 색상 선택
- 순차적 데이터: 단일 색상의 명도 변화
- 발산적 데이터: 양극단 색상 사용 (예: 파랑-하양-빨강)
- 색각 이상 고려: ColorBrewer 등의 검증된 팔레트 사용

### 성능
- `useColorScale`은 내부적으로 메모이제이션됨
- `steps` 배열이 변경되지 않으면 colorscale도 변경되지 않음

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RegionFeatureCollection](./region-feature-collection.md)
