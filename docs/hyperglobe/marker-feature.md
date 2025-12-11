# MarkerFeature 컴포넌트

## 개요

MarkerFeature는 지구본 위에 **소수의 중요 지점을 마커와 라벨**로 표시하는 컴포넌트입니다.

- **용도**: 주요 도시, 랜드마크, 이벤트 위치 등 강조할 지점 표시
- **적합한 개수**: 50개 이하
- **특징**: SVG 아이콘, 텍스트 라벨, CSS 스타일링 지원

## 사용법

`HyperGlobe` 컴포넌트의 `markers` prop을 사용합니다:

```tsx
import { HyperGlobe } from 'hyperglobe';

function CityMarkers() {
  const markers = {
    items: [
      {
        id: 'seoul',
        coordinate: [126.978, 37.5665],
        label: '서울',
        icon: 'pin',
        style: { fill: '#ff0000', stroke: 'black' },
      },
      {
        id: 'tokyo',
        coordinate: [139.6503, 35.6762],
        label: '도쿄',
        icon: 'circle',
        style: { fill: '#0000ff' },
      },
      {
        id: 'custom',
        coordinate: [-122.4194, 37.7749],
        label: '샌프란시스코',
        icon: 'custom',
        iconPath: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
        style: { fill: '#ff5722' },
        scale: 1.5,
      },
    ],
    showLabels: true,
    defaultScale: 1,
    onMarkerClick: (marker) => console.log('Clicked:', marker.label),
  };

  return (
    <HyperGlobe
      hgmUrl="/maps/nations-mid.hgm"
      markers={markers}
    />
  );
}
```

## 구현 방식

### 기술 스택
- **@react-three/drei의 Html 컴포넌트** 사용
- SVG Path를 직접 렌더링
- HTML/CSS로 스타일링

### 주요 기능
1. **SVG 아이콘**: 미리 정의된 아이콘(pin, circle) 또는 커스텀 SVG Path로 다양한 마커 모양 표현
2. **텍스트 라벨**: 마커 아래에 라벨 표시
3. **자동 Billboard**: 항상 카메라를 향하도록 회전
4. **Occlusion**: 지구 반대편에서 자동으로 가려짐 (내적 기반 가시성 계산)

## Props

### SvgStyle 인터페이스

마커의 스타일을 정의하는 인터페이스입니다.

```typescript
export interface SvgStyle {
  /** 선 색상 */
  stroke?: string;

  /** 선 두께 */
  strokeWidth?: number;

  /** 채우기 색상 */
  fill?: string;

  /** 필터 */
  filter?: string;

  /** SVG 크기 비율 */
  scale?: number;
}
```

### MarkerConfig 인터페이스

```typescript
export interface MarkerConfig {
  /** 마커 식별자 (React key로 사용) */
  id: string;

  /** 마커 위치 [경도, 위도] */
  coordinate: [number, number];
  
  /**
   * 마커 아이콘 타입
   * - 'pin': 핀 모양 마커 (기본값)
   * - 'circle': 원형 마커
   * - 'custom': iconPath로 사용자 정의 SVG path 사용
   * @default 'pin'
   */
  icon?: 'pin' | 'circle' | 'custom';
  
  /** 사용자 정의 아이콘. icon이 'custom'인 경우에 적용됩니다. */
  iconPath?: string;
  
  /** 마커 라벨 텍스트 */
  label?: string;
  
  /** 마커 스타일 (fill, stroke 등) */
  style?: SvgStyle;
  
  /** 마커 크기 배율 */
  scale?: number;
  
  /** 사용자 정의 데이터 */
  data?: unknown;
}
```

### MarkersConfig 인터페이스

```typescript
export interface MarkersConfig {
  /** 마커 목록 */
  items: MarkerConfig[];
  
  /** 기본 마커 크기 */
  defaultScale?: number;
  
  /** 라벨 표시 여부 */
  showLabels?: boolean;
  
  /** 마커 클릭 이벤트 핸들러 */
  onMarkerClick?: (marker: MarkerConfig) => void;
  
  /** 마커 호버 이벤트 핸들러 (미구현) */
  onMarkerHover?: (marker: MarkerConfig | null) => void;
}
```

## 구현 세부사항

### 1. 좌표 변환

경위도 → 3D 카르테시안 좌표:

```typescript
import { CoordinateConverter } from '@hyperglobe/tools';

const coords = CoordinateConverter.convert(coordinate, 1);
const position = new THREE.Vector3(coords[0], coords[1], coords[2]);
```

### 2. 아이콘 타입 처리

`useMarkerShape` 훅을 사용하여 아이콘 타입에 따른 SVG path를 결정합니다.

```typescript
// 내장 아이콘 (marker-constant.ts)
export const PIN_ICON = `M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`;
export const CIRCLE_ICON = `M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16z`;

// use-marker-shape.ts
function useMarkerShape({ icon, iconPath }) {
  return useMemo(() => {
    switch (icon) {
      case 'pin': return PIN_ICON;
      case 'circle': return CIRCLE_ICON;
      case 'custom': return iconPath;  // iconPath가 없으면 콘솔 경고
      default: return PIN_ICON;
    }
  }, [icon, iconPath]);
}
```

### 3. Occlusion 처리 (가시성 계산)

`useFrame`을 사용하여 매 프레임마다 마커의 가시성을 계산합니다.

```tsx
useFrame(() => {
  // 마커 방향 벡터
  const markerDir = position.clone().normalize();
  
  // Globe의 Y축 회전을 마커 벡터에 적용
  const rotationEuler = new THREE.Euler(...UiConstant.globe.rotation);
  markerDir.applyEuler(rotationEuler);

  // 카메라 방향 벡터
  const cameraDir = camera.position.clone().normalize();

  // 내적 > 0.1: 같은 반구 (보임)
  const dotProduct = markerDir.dot(cameraDir);
  setIsVisible(dotProduct > 0.1);
});

if (!isVisible) return null;
```

## 성능 고려사항

- **마커 개수**: 50개 이하 권장
- **많은 마커**: 50개 이상이면 PointsFeature 사용 고려
- **최적화**: 카메라 시점 밖의 마커는 렌더링하지 않음

## 스타일링 가이드

### SvgStyle을 사용한 스타일링

```tsx
<HyperGlobe
  markers={{
    items: [{
      id: 'seoul',
      coordinate: [126.978, 37.5665],
      label: '서울',
      icon: 'pin',
      style: {
        fill: '#ff5722',
        stroke: 'black',
        strokeWidth: 1,
        scale: 1.5,
      },
    }],
  }}
/>
```

### 내부 CSS 스타일

마커 컴포넌트 내부에서는 다음과 같은 CSS 스타일이 적용됩니다:

```tsx
// 아이콘 스타일
{
  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  transform: `translateY(${iconSize / 2}px)`,
}

// 라벨 스타일
{
  fontSize: `${12 * scale}px`,
  fontWeight: 'bold',
  color: 'white',
  background: 'rgba(0,0,0,0.8)',
  padding: `${4 * scale}px ${8 * scale}px`,
  borderRadius: `${4 * scale}px`,
  whiteSpace: 'nowrap',
  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
}
```

## 파일 구조

```
marker-feature/
├── index.ts                 # export 정의
├── marker-feature.tsx       # 메인 컴포넌트
├── marker-interface.ts      # MarkerData 인터페이스 정의
├── marker-constant.ts       # PIN_ICON, CIRCLE_ICON SVG path 상수
├── use-marker-shape.ts      # 아이콘 타입에 따른 SVG path 반환 훅
├── marker-feature-story.tsx # 스토리용 컴포넌트
└── marker-feature.stories.tsx  # Storybook 스토리
```

### 스타일 병합

`useSvgStyle` 훅을 통해 기본 스타일과 사용자 스타일이 병합됩니다:

```typescript
// src/hooks/use-svg-style.ts
const appliedStyle = {
  ...UiConstant.svgFeature.default.style,  // 기본 스타일
  ...style,  // 사용자 스타일 (우선)
};
```

## 향후 개선 사항

1. **마커 클러스터링**: 가까운 마커들을 그룹화
2. **애니메이션**: 마커 등장/사라짐 효과
3. **커스텀 컴포넌트**: icon 대신 React 컴포넌트 전달
4. **줌 레벨 제어**: 줌 레벨에 따라 마커 표시/숨김
5. **onMarkerHover 구현**: 호버 이벤트 핸들러 실제 동작 구현

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RouteFeature 컴포넌트](./route-feature.md)
- [수학 라이브러리](./math-libraries.md)

## 참고

- [Html 컴포넌트 문서](https://github.com/pmndrs/drei#html)
- [SVG Path 문법](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [Material Icons SVG Paths](https://fonts.google.com/icons)
