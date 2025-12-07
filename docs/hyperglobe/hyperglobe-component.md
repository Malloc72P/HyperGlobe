# HyperGlobe 컴포넌트

## 개요

`HyperGlobe`는 WebGL 기반 3D 지구본을 렌더링하는 루트 컴포넌트입니다. Three.js와 React Three Fiber를 기반으로 구현되었습니다.

**Props 기반 설정 방식**을 사용하여 모든 피처와 설정을 단일 컴포넌트의 props로 전달합니다.

## 주요 기능

- **3D 지구본 렌더링**: WebGL Canvas를 통한 고성능 렌더링
- **HGM 파일 자동 로딩**: `hgmUrl`로 지도 데이터 자동 fetch
- **지역(Region) 피처**: 국가/지역 폴리곤 렌더링 및 컬러스케일 지원
- **경위선 격자(Graticule)**: 경선/위선 그리드 표시
- **라우트(Routes)**: 두 지점 간 대권항로 곡선 표시
- **마커(Markers)**: 지점 표시 및 라벨
- **카메라 컨트롤**: OrbitControls를 통한 회전, 줌 조작
- **카메라 트랜지션**: ref를 통한 명령형 카메라 이동 API
- **툴팁**: 호버 시 정보 표시
- **로딩 UI**: HGM 파일 로딩 중 표시
- **FPS 카운터**: 성능 모니터링

## 기본 사용법

```tsx
import { HyperGlobe } from 'hyperglobe';

function App() {
  return (
    <HyperGlobe
      hgmUrl="/maps/nations-mid.hgm"
      globe={{ style: { color: '#1a1a2e' } }}
      region={{ style: { fillColor: '#3b82f6' } }}
      graticule={{ longitudeStep: 15, latitudeStep: 15 }}
      onReady={() => console.log('렌더링 완료')}
    />
  );
}
```

## Props

### 필수 Props

| Prop | 타입 | 설명 |
|------|------|------|
| `hgmUrl` | `string` | HGM 파일 URL. HyperGlobe 내부에서 자동으로 fetch합니다. |

### 캔버스/컨테이너

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `id` | `string` | - | Canvas 요소의 id 속성 |
| `size` | `number \| string` | `'100%'` | 지구본 크기 |
| `maxSize` | `number \| string` | - | 최대 크기 |
| `style` | `CSSProperties` | - | Canvas 요소 스타일 |

### 지구본 설정 (`globe`)

```tsx
globe?: {
  style?: {
    color?: string;      // 구체 색상 (기본: '#0077be')
    roughness?: number;  // 거칠기 0~1 (기본: 0.5)
    metalness?: number;  // 금속성 0~1 (기본: 0)
  };
  wireframe?: boolean;   // 와이어프레임 모드 (기본: false)
  segments?: [number, number]; // 세그먼트 수 (기본: [64, 32])
}
```

### 카메라 설정 (`camera`)

```tsx
camera?: {
  initialPosition?: [number, number]; // 초기 위치 [경도, 위도] (기본: [0, 0])
  minDistance?: number;  // 최소 거리, 1.5 이상 (기본: 1.5)
  maxDistance?: number;  // 최대 거리, 10 이하 (기본: 10)
}
```

### 컨트롤 설정 (`controls`)

```tsx
controls?: {
  enableZoom?: boolean;    // 줌 활성화 (기본: true)
  enableRotate?: boolean;  // 회전 활성화 (기본: true)
  enablePan?: boolean;     // 팬 활성화 (기본: false)
}
```

### Region 피처 (`region`)

```tsx
region?: {
  style?: FeatureStyle;       // 기본 스타일
  hoverStyle?: FeatureStyle;  // 호버 스타일
  dataKey?: string;           // dataMap에서 사용할 키
  idField?: string;           // 피처 ID로 사용할 속성명 (예: 'ISO_A2')
  extrusion?: {
    color?: string;           // 측면 색상
  };
}
```

### 경위선 격자 (`graticule`)

```tsx
graticule?: GraticuleConfig | boolean;

// GraticuleConfig
{
  longitudeStep?: number;  // 경선 간격 (기본: 10)
  latitudeStep?: number;   // 위선 간격 (기본: 10)
  lineColor?: string;      // 선 색상 (기본: '#808080')
  lineWidth?: number;      // 선 두께 (기본: 1.2)
}
```

- `true`: 기본값으로 표시
- `false` 또는 생략: 표시하지 않음

### 라우트 (`routes`)

```tsx
routes?: RouteConfig[];

// RouteConfig
{
  id: string;              // 식별자 (React key)
  from: RoutePointConfig;  // 시작점
  to: RoutePointConfig;    // 끝점
  maxHeight: number;       // 최대 높이
  lineWidth: number;       // 선 너비
  segments?: number;       // 보간 개수 (기본: 500)
  style?: FeatureStyle;    // 스타일
  animated?: boolean;      // 애니메이션 (기본: true)
  animationDuration?: number; // 애니메이션 시간 ms (기본: 1000)
  animationDelay?: number;    // 시작 딜레이 ms (기본: 0)
  objectScale?: number;       // 헤드 크기 (기본: 1)
}

// RoutePointConfig
{
  coordinate: [number, number]; // [경도, 위도]
  label?: string;               // 마커 라벨
  style?: SvgStyle;             // 마커 스타일
}
```

### 마커 (`markers`)

```tsx
markers?: {
  items: MarkerConfig[];
  defaultScale?: number;   // 기본 스케일 (기본: 1)
  showLabels?: boolean;    // 라벨 표시 (기본: true)
  onMarkerClick?: (marker: MarkerConfig) => void;
  onMarkerHover?: (marker: MarkerConfig | null) => void;
}

// MarkerConfig
{
  id: string;
  coordinate: [number, number];
  icon?: 'pin' | 'circle' | 'custom';
  iconPath?: string;       // icon이 'custom'인 경우
  label?: string;
  style?: SvgStyle;
  scale?: number;
  data?: unknown;
}
```

### 컬러스케일 (`colorscale`)

```tsx
colorscale?: {
  model: ColorScaleModel;  // useColorScale 훅으로 생성
  dataKey?: string;        // region.dataKey와 동일하게 설정
}
```

### 컬러스케일 바 (`colorscaleBar`)

```tsx
colorscaleBar?: ColorscaleBarConfig | boolean;

// ColorscaleBarConfig
{
  show?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  title?: string;
  style?: CSSProperties;
  formatLabel?: (value: number) => string;
}
```

### 툴팁 (`tooltip`)

```tsx
tooltip?: TooltipConfig | boolean;

// TooltipConfig
{
  show?: boolean;
  style?: CSSProperties;
  distance?: number;  // 커서와의 거리 px (기본: 10)
  text?: string | ((model: RegionModel) => string);
}
```

### UI 옵션

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `showFpsCounter` | `boolean` | `false` | FPS 카운터 표시 |
| `showLoadingUI` | `boolean` | `true` | 로딩 UI 표시 |

### 데이터 (`dataMap`)

```tsx
dataMap?: Record<string, Record<string, number>>;

// 예시
dataMap={{
  gdp: { KOR: 1800000, JPN: 4900000, USA: 25000000 },
  population: { KOR: 51780000, JPN: 125800000, USA: 331000000 }
}}
```

### 이벤트

| Prop | 타입 | 설명 |
|------|------|------|
| `onReady` | `() => void` | HGM 로드 및 렌더링 완료 시 (최초 1회) |
| `onHoverChanged` | `(param: HoverChangedEventParam) => void` | 호버된 지역 변경 시 |

## 고급 사용법

### 컬러스케일과 함께 사용

```tsx
import { HyperGlobe, useColorScale } from 'hyperglobe';

function DataVisualization() {
  const { colorscale } = useColorScale({
    steps: [
      { to: 1000000, style: { fillColor: '#eff6ff' } },
      { from: 1000000, to: 10000000, style: { fillColor: '#3b82f6' } },
      { from: 10000000, style: { fillColor: '#1e40af' } },
    ],
  });

  const gdpData = {
    KOR: 1800000,
    JPN: 4900000,
    USA: 25000000,
  };

  return (
    <HyperGlobe
      hgmUrl="/maps/nations-mid.hgm"
      dataMap={{ gdp: gdpData }}
      region={{ dataKey: 'gdp', idField: 'ISO_A3' }}
      colorscale={{ model: colorscale }}
      colorscaleBar={{ position: 'bottom-right' }}
    />
  );
}
```

### 카메라 트랜지션 (명령형 API)

```tsx
import { HyperGlobe, HyperglobeRef } from 'hyperglobe';
import { useRef } from 'react';

function CameraDemo() {
  const globeRef = useRef<HyperglobeRef>(null);

  const flyToSeoul = () => {
    globeRef.current?.followPath([
      { coordinate: [126.978, 37.5665], duration: 2000 }
    ]);
  };

  return (
    <>
      <button onClick={flyToSeoul}>서울로 이동</button>
      <HyperGlobe
        ref={globeRef}
        hgmUrl="/maps/nations-mid.hgm"
      />
    </>
  );
}
```

### 라우트와 마커

```tsx
const routes = [
  {
    id: 'seoul-london',
    from: { coordinate: [126.978, 37.5665], label: '서울' },
    to: { coordinate: [-0.1278, 51.5074], label: '런던' },
    maxHeight: 0.3,
    lineWidth: 3,
    animationDuration: 2000,
  },
];

const markers = {
  items: [
    { id: 'tokyo', coordinate: [139.6503, 35.6762], label: '도쿄', icon: 'pin' },
  ],
  showLabels: true,
  onMarkerClick: (marker) => console.log('Clicked:', marker.label),
};

<HyperGlobe
  hgmUrl="/maps/nations-mid.hgm"
  routes={routes}
  markers={markers}
/>
```

## 동작 규칙

| 상태 | 동작 |
|------|------|
| `hgmUrl` 변경 | 새 HGM 파일 로드, 로딩 UI 표시 |
| HGM 로딩 중 | `showLoadingUI`가 true면 로딩 UI 표시 |
| HGM 로드 완료 | 피처 렌더링 시작, `onReady` 호출 |
| `dataMap`에 없는 키 참조 | 해당 피처 렌더링 생략 |

## 기술 세부사항

### 렌더링 파이프라인

1. `hgmUrl`로 HGM 파일 fetch
2. `useHGM` 훅으로 HGM 파싱
3. React Three Fiber `Canvas`에서 WebGL 렌더링
4. `OrbitControls`로 카메라 제어
5. `RegionFeatureCollection`으로 지역 피처 렌더링 (지오메트리 병합으로 최적화)
6. 기타 피처 (Graticule, Routes, Markers) 렌더링
7. `onReady` 콜백 호출

### 색상 공간 설정

- `toneMapping`: NoToneMapping
- 색상 재현의 정확성과 일관성을 보장

### 상태 관리

- Zustand 기반 메인 스토어
- 툴팁, 호버 상태, R-Tree 공간 인덱싱 등 전역 관리

## 관련 문서

- [RegionFeatureCollection](./region-feature-collection.md) - 지역 피쳐 렌더링
- [Graticule](./graticule.md) - 경위선 격자
- [RouteFeature](./route-feature.md) - 라우트 피쳐
- [MarkerFeature](./marker-feature.md) - 마커 피쳐
- [ColorScale 시스템](./colorscale.md) - 데이터 시각화
- [카메라 트랜지션](./camera-transition.md) - 명령형 카메라 API
- [메인 스토어](./main-store.md) - 상태 관리

## 파일 구조

```
packages/hyperglobe/src/components/hyperglobe/
├── index.ts                    # export 정의
├── hyperglobe.tsx              # 메인 컴포넌트
├── globe.tsx                   # 내부 Globe 메쉬 컴포넌트
├── hyperglobe.stories.tsx      # Storybook 스토리
└── hyperglobe.guide.mdx        # MDX 가이드
```
