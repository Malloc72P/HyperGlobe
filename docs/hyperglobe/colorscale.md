# ColorScale 시스템

## 개요

데이터 값에 따라 지역에 자동으로 색상을 적용하는 시스템입니다.

**파일**:
- `packages/hyperglobe/src/hooks/use-colorscale.ts` - useColorScale 훅
- `packages/hyperglobe/src/components/colorscale-bar/` - ColorScaleBar 컴포넌트

**사용 예시**: Storybook의 `ColorScale` 스토리 참조

## 구성 요소

- **useColorScale 훅**: 데이터 기반 컬러스케일 모델 생성
- **colorscale prop**: HyperGlobe에 모델 전달
- **colorscaleBar prop**: 범례 UI 표시

## 기본 사용법

```tsx
import { HyperGlobe, useColorScale } from 'hyperglobe';

const { colorscale } = useColorScale({
  steps: [
    { to: 1000000, color: '#eff6ff', hoverColor: '#dbeafe' },
    { from: 1000000, to: 10000000, color: '#3b82f6', hoverColor: '#60a5fa' },
    { from: 10000000, color: '#1e40af', hoverColor: '#3b82f6' },
  ],
  nullColor: '#e5e7eb',
});

<HyperGlobe
  hgmUrl="/maps/nations-mid.hgm"
  dataMap={{ gdp: { KOR: 1800000, JPN: 4900000 } }}
  region={{ dataKey: 'gdp', idField: 'ISO_A3' }}
  colorscale={{ model: colorscale }}
  colorscaleBar={{
    position: 'bottom-right',
    formatLabel: (value) => `${(value / 1000000).toFixed(1)}M`,
  }}
/>
```

## useColorScale 훅

**타입 정의**: `packages/hyperglobe/src/hooks/use-colorscale.ts`

### 핵심 개념

**컴러스케일 구간 (Step)**
- 값의 범위를 구간으로 나누고 각 구간에 색상 지정
- `from` 이상, `to` 미만: `[0, 100)`, `[100, 500)`, `[500, ∞)`
- 생략된 값은 무한대로 처리

> **상세 Props**: 타입 정의 파일 또는 Storybook 참조

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

## ColorScaleBar

**타입 정의**: `packages/hyperglobe/src/types/hyperglobe-props.ts` (`ColorscaleBarConfig`)

> **상세 Props**: 타입 정의 파일 또는 Storybook 참조

## 기술 세부사항

### 색상 적용 우선순위

1. ColorScale 색상 (최우선)
2. `region.style` prop
3. 기본 스타일

> 컬러스케일이 설정되면 `region.style.fillColor`는 무시됩니다.

### 무한대 처리

- `from` 생략 → `-Infinity`
- `to` 생략 → `+Infinity`
- ColorScaleBar에서는 데이터의 실제 최솟값/최댓값으로 표시

### 헬퍼 함수

```typescript
findStepByValue(colorscale, value)     // 값에 해당하는 구간 찾기
isCurrentStep(step, value)             // 값이 구간에 속하는지 확인
getColorScaleColor(colorscale, value)  // 값에 따른 색상 반환
```

## 모범 사례

- 구간은 연속적이어야 함 (빈틈 없이)
- 첫 구간 `from`과 마지막 구간 `to`는 생략 권장
- 구간 수는 5-7개가 적절
- 순차적 데이터: 단일 색상의 명도 변화
- ColorBrewer 등의 검증된 팔레트 사용 권장

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RegionFeatureCollection](./region-feature-collection.md)
- ColorScaleBar에서는 데이터의 실제 최솟값/최댓값으로 표시

### 헬퍼 함수

```typescript
findStepByValue(colorscale, value)     // 값에 해당하는 구간 찾기
isCurrentStep(step, value)             // 값이 구간에 속하는지 확인
getColorScaleColor(colorscale, value)  // 값에 따른 색상 반환
```

## 모범 사례

- 구간은 연속적이어야 함 (빈틈 없이)
- 첫 구간 `from`과 마지막 구간 `to`는 생략 권장
- 구간 수는 5-7개가 적절
- 순차적 데이터: 단일 색상의 명도 변화
- ColorBrewer 등의 검증된 팔레트 사용 권장

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RegionFeatureCollection](./region-feature-collection.md)
