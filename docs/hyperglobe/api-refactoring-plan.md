# HyperGlobe API 리팩토링 계획

## 개요

HyperGlobe의 API를 **컴포넌트 조합 방식**에서 **단일 Props 기반 설정 방식**으로 전환한다.

---

## 배경: 왜 구조를 변경하는가?

### 문제 1: 렌더링 완료 시점 감지 어려움

현재 구조에서는 사용자가 자식 컴포넌트로 피처를 추가하는 방식이다.

```tsx
<HyperGlobe>
  {hgm && <RegionFeature hgm={hgm} />}
  <Graticule />
</HyperGlobe>
```

이 경우 HyperGlobe는 "무엇을 그려야 하는지" 전체 그림을 알 수 없다. 특히 비동기로 데이터를 가져오는 경우, 초기에는 피처가 마운트되지 않아 렌더링 완료 시점을 판단할 수 없다.

**결과:** 로딩 UI 제어, 애니메이션 시작 타이밍 등을 정확히 잡을 수 없음.

### 문제 2: 성능 최적화 어려움

RegionFeatureCollection 작업에서 확인했듯이, 드로우콜을 최소화하려면 지오메트리를 병합해야 한다. 하지만 사용자가 직접 컴포넌트를 추가하는 구조에서는 각 컴포넌트가 개별 드로우콜이 되어 성능이 저하된다.

HyperGlobe가 모든 데이터를 알고 있다면 내부에서 지오메트리를 병합하여 최적화할 수 있다.

### 문제 3: 설정이 비직관적

데이터를 RegionFeature에도 전달하고, ColorScale에도 전달해야 하는 등 중복이 발생한다. 사용자 입장에서는 한번 전달하고 끝내고 싶어할 것이다.

---

## 해결책: Props 기반 설정

모든 설정을 HyperGlobe 컴포넌트의 props로 전달한다.

```tsx
<HyperGlobe
  hgm={hgm}
  dataMap={{ gdp: gdpData }}
  region={{ dataKey: 'gdp', style: {...} }}
  colorscale={{ dataKey: 'gdp', domain: [...], range: [...] }}
  colorscaleBar={{ position: 'bottom-right' }}
  onReady={() => setLoading(false)}
/>
```

### 장점

1. **렌더링 완료 시점 명확**: HyperGlobe가 모든 데이터를 알고 있으므로 완료 시점 판단 가능
2. **최적화 완전 제어**: 내부에서 지오메트리 병합, 배칭 등 자유롭게 처리
3. **데이터 중복 제거**: `dataMap`에 한번만 넣고, 각 피처에서 `dataKey`로 참조

---

## 최종 API 형태

```tsx
const hgmBlob = await fetch('/maps/world.hgm').then(r => r.blob());
const [hgm] = useHGM({ rawHgmBlob: hgmBlob });
const gdpData = await fetchGdpData();

<HyperGlobe
  // 필수
  hgm={hgm}

  // 데이터
  dataMap={{ gdp: gdpData }}

  // 캔버스/컨테이너
  id="globe"
  size="100%"
  maxSize={800}
  style={{ background: '#000' }}

  // 지구본
  globe={{
    style: { color: '#1a1a2e', opacity: 1 },
    wireframe: false,
  }}

  // 카메라
  camera={{
    initialPosition: [127, 37],  // 서울
  }}

  // 컨트롤
  controls={{
    enableZoom: true,
    enableRotate: true,
    enablePan: false,
  }}

  // 피처
  region={{
    dataKey: 'gdp',
    style: { opacity: 0.8 },
    hoverStyle: { opacity: 1 },
  }}
  graticule={{ step: 15 }}
  routes={[...]}
  markers={[...]}

  // UI
  colorscale={{
    dataKey: 'gdp',
    domain: [0, 1000000],
    range: ['#ffe5e5', '#ff0000'],
  }}
  colorscaleBar={{
    position: 'bottom-right',
    title: 'GDP (USD)',
  }}
  tooltip={{ distance: 10 }}
  showFpsCounter={false}
  showLoadingUI={true}

  // 이벤트
  onReady={() => console.log('렌더링 완료')}
  onHoverChanged={(region) => console.log(region)}
/>
```

---

## 동작 규칙

| 상태 | 동작 |
|------|------|
| `hgm === null` | 로딩 상태, `showLoadingUI`가 true면 내장 로딩 UI 표시 |
| `hgm !== null` | 렌더링 시작 |
| 렌더링 완료 | `onReady()` 호출 (최초 1회) |
| `dataMap`에 없는 키 참조 | 런타임 경고 메시지 출력, graceful fallback |

### 데이터 로딩 규칙

- HGM 로딩은 사용자가 담당 (어디서 어떻게 가져올지 모르므로)
- `useHGM` 훅으로 Blob → HGM 객체 변환 기능 제공
- `hgm`이 `null`이면 로딩 상태로 간주
- `dataMap`은 준비된 데이터만 전달, 없으면 해당 피처 props도 생략

```tsx
<HyperGlobe 
  hgm={hgm}
  dataMap={gdpData ? { gdp: gdpData } : undefined}
  region={gdpData ? { dataKey: 'gdp', ... } : undefined}
/>
```

---

## 구현 계획

### Phase 1: 코어 구조

| 작업 | 설명 |
|------|------|
| Props 타입 정의 | `HyperGlobeProps`, `RegionConfig`, `GlobeConfig` 등 |
| HyperGlobe 컴포넌트 재작성 | Props 기반 렌더링, children 제거 |
| 로딩 상태 내부 관리 | `hgm === null` → 로딩, `showLoadingUI` prop |
| Globe 렌더러 | 기존 로직 활용, `globe` prop 적용 |
| Region 렌더러 | RegionFeatureCollection 로직 내부화 |

**검증:** nations2 데모가 새 API로 동작하는지 확인

### Phase 2: UI 피처

| 작업 | 설명 |
|------|------|
| Colorscale 내부화 | `colorscale` prop 기반 계산 |
| ColorscaleBar 내부 배치 | HyperGlobe 내부에서 렌더링, position 제어 |
| Graticule 내부화 | `graticule` prop 기반 |
| Tooltip 내부화 | `tooltip` prop 기반 |

### Phase 3: 이벤트 및 완료 감지

| 작업 | 설명 |
|------|------|
| 렌더링 완료 감지 | 모든 피처 준비 완료 시점 추적 |
| `onReady` 구현 | 최초 1회 호출 |
| `onHoverChanged` 유지 | 기존 로직 활용 |

### Phase 4: 추가 피처 (선택적)

| 작업 | 설명 |
|------|------|
| Routes 렌더러 | `routes` prop 기반, 지오메트리 병합 |
| Markers 렌더러 | `markers` prop 기반 |
| Points 렌더러 | 필요 시 |

### Phase 5: 정리

| 작업 | 설명 |
|------|------|
| 기존 컴포넌트 export 제거 | RegionFeature, RouteFeature 등 외부 노출 제거 |
| Storybook 마이그레이션 | nations2 먼저, 나머지 점진적 |
| 문서 업데이트 | API 문서 재작성 |

---

## 유지 항목

- `useHGM` 훅 (현재 그대로)
- `useColorScale` 훅 (외부에서 colorscale 계산 후 전달 가능하도록)
- 기존 카메라 트랜지션 로직 (`ref`를 통한 명령형 API)

## 제거 항목

- `children` prop
- 외부에서 사용하던 피처 컴포넌트들 (RegionFeature, RouteFeature, Graticule 등)
- `loading` prop (외부 제어 방식)

---

## 참고

- 작성일: 2024년 12월
- 관련 브랜치: `Malloc72P/optimize-region` 이후 작업
