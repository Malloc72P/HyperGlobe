# ColorScale 시스템

## 개요

ColorScale은 데이터 값에 따라 지역에 자동으로 색상을 적용하는 시스템입니다. `useColorScale` 훅으로 컬러스케일을 생성하고, `ColorScaleBar` 컴포넌트로 시각적 범례를 표시할 수 있습니다.

## 구성 요소

### useColorScale 훅
데이터 기반 컬러스케일 모델을 생성합니다.

### ColorScaleBar 컴포넌트
컬러스케일을 시각적으로 표시하는 범례 UI 컴포넌트입니다.

## useColorScale 훅

### 기본 개념

**컬러스케일 구간(Step)**
- 값의 범위를 여러 구간으로 나누고, 각 구간에 스타일 지정
- 구간은 `from` 이상, `to` 미만으로 정의됨
- 예: `[0, 100)`, `[100, 500)`, `[500, ∞)`

### Props

#### steps (필수)
컬러스케일 구간 배열
```typescript
{
  label?: string;          // 구간 레이블
  from?: number;           // 하한 (포함, 생략 시 -∞)
  to?: number;             // 상한 (미포함, 생략 시 +∞)
  style?: FeatureStyle;    // 적용할 스타일
  hoverStyle?: FeatureStyle; // 호버 스타일
}[]
```

#### data (선택)
원본 데이터 배열

#### nullStyle (선택)
값이 null인 경우 적용할 스타일

#### itemResolver (선택)
피쳐와 데이터 항목을 매칭하는 함수
```typescript
(feature: HGMFeature, dataItem: any) => boolean
// 기본값: (feature, item) => feature.id === item.id
```

#### valueResolver (선택)
데이터 항목에서 값을 추출하는 함수
```typescript
(dataItem: any) => number | null | undefined
// 기본값: (dataItem) => dataItem.value
```

### 반환값

#### colorscale
컬러스케일 모델 (`ColorScaleModel`)
- RegionFeature에 전달하면 값에 따라 스타일이 자동 적용됩니다.

#### resolveFeatureData
피쳐에 해당하는 데이터를 찾아 반환하는 함수
```typescript
(feature: HGMFeature) => { value: number | null }
```
- RegionFeature의 `data` prop에 전달합니다.
- 값이 null인 피쳐에 대한 스타일은 `nullStyle`로 지정합니다.

## 사용 예시

### 기본 사용
```tsx
import { HyperGlobe, RegionFeature, useColorScale } from 'hyperglobe';

function GDPMap() {
  const gdpData = [
    { id: 'KOR', value: 50000 },
    { id: 'USA', value: 70000 },
    { id: 'JPN', value: 40000 }
  ];

  const { colorscale, resolveFeatureData } = useColorScale({
    steps: [
      { 
        from: 0, 
        to: 20000, 
        style: { fillColor: '#fee5d9' } 
      },
      { 
        from: 20000, 
        to: 40000, 
        style: { fillColor: '#fcae91' } 
      },
      { 
        from: 40000, 
        to: 60000, 
        style: { fillColor: '#fb6a4a' } 
      },
      { 
        from: 60000, 
        to: Infinity, 
        style: { fillColor: '#cb181d' } 
      }
    ],
    data: gdpData
  });

  return (
    <HyperGlobe>
      {features.map(feature => (
        <RegionFeature
          key={feature.id}
          feature={feature}
          colorscale={colorscale}
          data={resolveFeatureData(feature)}
        />
      ))}
    </HyperGlobe>
  );
}
```

### 커스텀 데이터 구조
```tsx
// 데이터 구조가 다른 경우
const populationData = [
  { countryCode: 'KOR', population: 51000000 },
  { countryCode: 'USA', population: 331000000 }
];

const { colorscale, resolveFeatureData } = useColorScale({
  steps: [...],
  data: populationData,
  itemResolver: (feature, item) => feature.id === item.countryCode,
  valueResolver: (item) => item.population
});

// RegionFeature에 data prop 전달
<RegionFeature
  feature={feature}
  colorscale={colorscale}
  data={resolveFeatureData(feature)}
/>
```

### null 값 처리
```tsx
const { colorscale } = useColorScale({
  steps: [...],
  data: gdpData,
  nullStyle: {
    fillColor: '#e0e0e0',  // 회색으로 표시
    opacity: 0.3
  }
});
```

## ColorScaleBar 컴포넌트

### Props

- `colorScale`: useColorScale로 생성한 컬러스케일 모델 (필수)
- `style`: 루트 요소 스타일
- `formatLabel`: 레이블 포맷 함수

### 기능

**값 범위 표시**
- 각 구간의 경계 값을 표시
- 무한대는 실제 데이터의 최솟값/최댓값으로 표시

**현재 값 마커**
- 호버된 지역의 값 위치를 실시간 표시
- 막대 위에 마커로 시각화

**레이블 포맷팅**
- 기본: 소수점 없이 정수로 표시
- 커스텀 포맷터로 천 단위 구분 등 적용 가능

## 사용 예시

### 기본 사용
```tsx
import { ColorScaleBar, useColorScale } from 'hyperglobe';

function App() {
  const { colorscale, resolveFeatureData } = useColorScale({...});

  return (
    <div>
      <HyperGlobe>
        {features.map(feature => (
          <RegionFeature
            key={feature.id}
            feature={feature}
            colorscale={colorscale}
            data={resolveFeatureData(feature)}
          />
        ))}
      </HyperGlobe>
      
      <ColorScaleBar colorScale={colorscale} />
    </div>
  );
}
```

### 레이블 포맷팅
```tsx
// 천 단위 구분 쉼표
<ColorScaleBar
  colorScale={colorscale}
  formatLabel={(value) => value.toLocaleString()}
/>

// 단위 표시
<ColorScaleBar
  colorScale={colorscale}
  formatLabel={(value) => `${value.toFixed(1)}억`}
/>
```

### 스타일 커스터마이징
```tsx
<ColorScaleBar
  colorScale={colorscale}
  style={{
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px'
  }}
/>
```

## 기술 세부사항

### 컬러스케일 모델 구조
```typescript
interface ColorScaleModel {
  nullStyle?: FeatureStyle;      // 값이 null인 경우 적용될 스타일
  steps: ColorScaleStepModel[];  // 컬러스케일 구간 목록
  minValue: number;              // 데이터 최솟값
  maxValue: number;              // 데이터 최댓값
}

interface ColorScaleStepModel {
  id: string;                    // 구간 고유 ID (자동 생성: "cs-step-{index}")
  stepTotal: number;             // 전체 구간 수
  index: number;                 // 현재 구간 인덱스 (0부터 시작)
  label: string;                 // 구간 레이블
  from: number;                  // 하한 (포함)
  to: number;                    // 상한 (미포함)
  style?: FeatureStyle;          // 적용할 스타일
  hoverStyle?: FeatureStyle;     // 호버 스타일
}
```

### 스타일 적용 우선순위
1. **컬러스케일** (최우선)
2. style prop
3. 기본 스타일

RegionFeature에 컬러스케일이 설정되면, style prop은 무시됩니다.

### 마커 위치 계산

ColorScaleBar의 마커는 호버된 지역의 값 위치를 실시간으로 표시합니다:

```typescript
// 1. 값이 속한 구간 찾기
const step = findStepByValue(colorscale, value);

// 2. 구간의 from/to 값 계산 (무한대는 minValue/maxValue로 대체)
const from = resolveNumber(step.from, minValue);
const to = resolveNumber(step.to, maxValue);

// 3. 스텝 너비 및 시작 위치 계산
const stepWidth = 1 / colorscale.steps.length;
const startPosition = step.index / colorscale.steps.length;

// 4. 구간 내 상대 위치 계산 (0~1 사이)
const stepRange = to - from;
const relativePosition = (value - from) / stepRange;

// 5. 최종 위치 계산 (0~100%)
const position = startPosition + relativePosition * stepWidth;
return Math.max(0, Math.min(100, position * 100));
```

### 무한대 처리

구간의 `from`이나 `to`가 생략되면 무한대로 처리됩니다:
- `from` 생략 → `-Infinity`
- `to` 생략 → `+Infinity`

실제 표시 시에는 데이터의 실제 최솟값/최댓값으로 대체됩니다.

## 사용된 수학 라이브러리

#### @hyperglobe/tools
- `isSafeNumber(value)`: 안전한 숫자 여부 확인 (NaN, Infinity 제외)
- `resolveNumber(value, fallback)`: 유효하지 않은 숫자는 fallback으로 대체

#### 헬퍼 함수
- `findStepByValue`: 값에 해당하는 구간 찾기
- `isCurrentStep`: 값이 특정 구간에 속하는지 확인
- `getColorScaleStyle`: 값에 따른 스타일 반환
- `getColorScaleHoverStyle`: 값에 따른 호버 스타일 반환

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
- 데이터가 변경되지 않으면 `data` prop도 변경하지 않기 (메모이제이션)
- 컬러스케일은 자동으로 메모이제이션됨

## 관련 문서
- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RegionFeature 컴포넌트](./region-feature.md)
