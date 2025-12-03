# RegionFeatureCollection 컴포넌트

## 개요

`RegionFeatureCollection`은 여러 지역(국가, 행정구역 등)을 **하나의 병합된 지오메트리**로 렌더링하는 최적화된 컴포넌트입니다.

기존 `RegionFeature`가 개별 국가마다 드로우콜을 발생시켜 성능 문제가 있었던 것을 해결합니다.

### 성능 비교

| 항목 | RegionFeature (삭제됨) | RegionFeatureCollection |
|------|----------------------|------------------------|
| 드로우콜 (200개 국가) | ~600 | ~6 |
| 국가별 색상 | ✅ 개별 메시 | ✅ Vertex Color |
| ColorScale 지원 | ✅ | ✅ |
| 호버 지원 | ✅ | ✅ (오버레이 방식) |

## 주요 기능

### 지오메트리 병합
- 모든 국가의 상단면을 하나의 `BufferGeometry`로 병합
- 모든 국가의 측면을 하나의 `BufferGeometry`로 병합
- 모든 국가의 외곽선을 하나의 좌표 배열로 병합

### Vertex Color
- 국가별로 다른 색상을 적용하기 위해 **Vertex Color** 사용
- 각 국가의 모든 정점에 동일한 색상을 할당하여 단색 면 표현
- ColorScale과 연동하여 데이터 시각화 가능

### 호버 오버레이
- 호버된 국가만 별도의 지오메트리로 동적 생성
- `polygonOffset`으로 Z-fighting 방지
- 호버 스타일 적용 (ColorScale 호버 색상 지원)

## Props

### 필수
| Prop | 타입 | 설명 |
|------|------|------|
| `features` | `HGMFeature[]` | 렌더링할 features 배열 |

### 선택
| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `style` | `FeatureStyle` | - | 기본 스타일 |
| `hoverStyle` | `FeatureStyle` | - | 호버 시 적용될 스타일 |
| `colorscale` | `ColorScaleModel` | - | 데이터 시각화를 위한 컬러스케일 |
| `data` | `Record<string, number>` | - | 피쳐별 데이터 (컬러스케일 적용용) |
| `idField` | `string` | - | 피쳐의 id로 사용할 속성 이름 |
| `valueField` | `string` | `'value'` | 피쳐의 값으로 사용할 속성 이름 |
| `extrusion` | `{ color?: string }` | `{ color: Colors.GRAY[8] }` | 측면 옵션 |

## 사용 예시

### 기본 사용

```tsx
import { HyperGlobe, RegionFeatureCollection, useHGM } from 'hyperglobe';

function Map() {
  const hgm = useHGM('/maps/world.hgm');

  if (!hgm) return null;

  return (
    <HyperGlobe>
      <RegionFeatureCollection
        features={hgm.features}
        style={{ fillColor: '#3b82f6', color: '#1e3a8a' }}
      />
    </HyperGlobe>
  );
}
```

### ColorScale과 함께 사용

```tsx
import { HyperGlobe, RegionFeatureCollection, useHGM, useColorScale } from 'hyperglobe';

function DataVisualization() {
  const hgm = useHGM('/maps/world.hgm');
  
  const { colorscale } = useColorScale({
    steps: [
      { from: 0, to: 1000000, color: '#eff6ff' },
      { from: 1000000, to: 10000000, color: '#3b82f6' },
      { from: 10000000, color: '#1e40af' },
    ],
  });

  // 국가별 인구 데이터
  const populationData = {
    KOR: 51780000,
    JPN: 125800000,
    CHN: 1412000000,
    // ...
  };

  if (!hgm) return null;

  return (
    <HyperGlobe>
      <RegionFeatureCollection
        features={hgm.features}
        colorscale={colorscale}
        data={populationData}
      />
    </HyperGlobe>
  );
}
```

### idField 활용 (ISO-A2 매핑)

HGM 파일의 기본 id는 ISO-A3 코드이지만, 데이터가 ISO-A2 기준인 경우:

```tsx
const populationData = {
  KR: 51780000,  // ISO-A2
  JP: 125800000,
  CN: 1412000000,
};

<RegionFeatureCollection
  features={hgm.features}
  colorscale={colorscale}
  data={populationData}
  idField="ISO_A2"  // properties.ISO_A2를 키로 사용
/>
```

## 기술 세부사항

### 최적화 원리

#### 1. 지오메트리 병합

개별 국가의 지오메트리를 하나로 병합하여 드로우콜 최소화:

```
기존: 국가1 메시 + 국가2 메시 + ... + 국가N 메시 = N 드로우콜
최적화: 병합된 메시 1개 = 1 드로우콜
```

상단면, 측면, 외곽선 각각 1개씩 = 총 3 드로우콜 (+ 호버 오버레이 3개)

#### 2. Vertex Color

하나의 메시에서 국가별로 다른 색상을 표현하는 방법:

```typescript
// 각 정점에 RGB 색상 할당
const colors = new Float32Array(vertexCount * 3);
for (let i = 0; i < vertexCount; i++) {
  colors[i * 3]     = r;  // Red
  colors[i * 3 + 1] = g;  // Green
  colors[i * 3 + 2] = b;  // Blue
}
geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
```

- 같은 국가의 모든 정점에 동일한 색상 → 단색 면
- GPU가 정점 간 색상을 보간하므로, 다른 색상이면 그라데이션 발생

#### 3. 호버 오버레이

호버된 국가만 별도로 렌더링:

1. R-Tree에서 마우스 위치의 국가 탐색
2. 해당 국가의 지오메트리 동적 생성
3. `polygonOffset`으로 기존 메시 위에 렌더링
4. 호버 스타일 적용

```tsx
<mesh geometry={hoveredGeometry}>
  <meshBasicMaterial
    polygonOffset
    polygonOffsetFactor={-1}
    polygonOffsetUnits={-1}
  />
</mesh>
```

### 스타일 적용 우선순위

1. **기본 스타일** (`UiConstant.polygonFeature.default.style`)
2. **사용자 지정 스타일** (`style` prop)
3. **ColorScale 색상** (`colorscale` + `data`)
4. **호버 스타일** (`hoverStyle` prop + ColorScale 호버 색상)

### 색상 적용 범위

| 요소 | 국가별 색상 | 비고 |
|------|-----------|------|
| 상단면 (fillColor) | ✅ 가능 | Vertex Color |
| 측면 (extrusion) | ❌ 불가 | 단일 색상 |
| 외곽선 (color) | ❌ 불가 | 단일 색상 |

## 내부 구조

### 관련 파일

| 파일 | 역할 |
|------|------|
| `region-feature-collection.tsx` | 메인 컴포넌트 |
| `use-merged-geometry.ts` | 지오메트리 병합 및 Vertex Color 적용 |
| `use-batch-region-models.ts` | R-Tree 배치 등록 (호버 감지용) |
| `hovered-region-overlay.tsx` | 호버 오버레이 렌더링 |

### 사용된 라이브러리

- **Three.js**: `BufferGeometry`, `mergeGeometries`, `Float32BufferAttribute`
- **@react-three/drei**: `Line` 컴포넌트
- **RBush**: R-Tree 공간 인덱싱 (호버 감지)

## 제약사항

- 폴리곤과 멀티폴리곤만 지원
- HGM 포맷으로 전처리된 데이터 필요
- 외곽선과 측면은 전체 동일 색상만 가능

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [ColorScale 시스템](./colorscale.md)
- [메인 스토어](./main-store.md) - R-Tree, 호버 상태 관리
- [수학 라이브러리](./math-libraries.md)
