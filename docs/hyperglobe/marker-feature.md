# MarkerFeature 컴포넌트

## 개요

MarkerFeature는 지구본 위에 **소수의 중요 지점을 마커와 라벨**로 표시하는 컴포넌트입니다.

- **용도**: 주요 도시, 랜드마크, 이벤트 위치 등 강조할 지점 표시
- **적합한 개수**: 50개 이하
- **특징**: SVG 아이콘, 텍스트 라벨, CSS 스타일링 지원

## 구현 방식

### 기술 스택
- **@react-three/drei의 Html 컴포넌트** 사용
- SVG Path를 직접 렌더링
- HTML/CSS로 스타일링

### 주요 기능
1. **SVG 아이콘**: 커스텀 SVG Path로 다양한 마커 모양 표현
2. **텍스트 라벨**: 마커 아래 또는 옆에 라벨 표시
3. **자동 Billboard**: 항상 카메라를 향하도록 회전
4. **Occlusion**: 지구 반대편에서 자동으로 가려짐

## Props 설계

```typescript
export interface MarkerData {
  /** 마커 위치 (경도, 위도) */
  position: LonLat;
  
  /** SVG path 문자열 (선택사항) */
  icon?: string;
  
  /** 마커 라벨 텍스트 */
  label?: string;
  
  /** 마커 색상 */
  color?: string;
  
  /** 마커 크기 배율 */
  scale?: number;
  
  /** 사용자 정의 데이터 */
  data?: any;
}

export interface MarkerFeatureProps {
  /** 표시할 마커 배열 */
  markers: MarkerData[];
  
  /** 기본 마커 색상 */
  defaultColor?: string;
  
  /** 기본 마커 크기 */
  defaultScale?: number;
  
  /** 라벨 표시 여부 */
  showLabels?: boolean;
  
  /** 마커 클릭 이벤트 핸들러 */
  onMarkerClick?: (marker: MarkerData) => void;
  
  /** 마커 호버 이벤트 핸들러 */
  onMarkerHover?: (marker: MarkerData | null) => void;
}
```

## 사용 예시

### 기본 사용

```tsx
import { HyperGlobe, MarkerFeature } from 'hyperglobe';

function App() {
  const markers = [
    {
      position: [37.5665, 126.9780], // 서울
      label: '서울',
      color: '#ff0000',
    },
    {
      position: [35.6762, 139.6503], // 도쿄
      label: '도쿄',
      color: '#0000ff',
    },
  ];

  return (
    <HyperGlobe>
      <MarkerFeature markers={markers} />
    </HyperGlobe>
  );
}
```

### 커스텀 SVG 아이콘

```tsx
const markers = [
  {
    position: [37.5665, 126.9780],
    label: '서울',
    // Material Icons의 location_on 아이콘
    icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    color: '#ff5722',
    scale: 1.5,
  },
];
```

### 이벤트 처리

```tsx
function App() {
  const handleMarkerClick = (marker: MarkerData) => {
    console.log('Clicked:', marker.label);
  };

  const handleMarkerHover = (marker: MarkerData | null) => {
    if (marker) {
      console.log('Hovering:', marker.label);
    }
  };

  return (
    <HyperGlobe>
      <MarkerFeature
        markers={markers}
        onMarkerClick={handleMarkerClick}
        onMarkerHover={handleMarkerHover}
      />
    </HyperGlobe>
  );
}
```

## 구현 세부사항

### 1. 좌표 변환

경위도 → 3D 카르테시안 좌표:

```typescript
import { lonLatToVector3 } from '@hyperglobe/tools';

const position3D = lonLatToVector3(marker.position, GLOBE_RADIUS);
```

### 2. Html 컴포넌트 사용

```tsx
import { Html } from '@react-three/drei';

function Marker({ marker }: { marker: MarkerData }) {
  const position = lonLatToVector3(marker.position);

  return (
    <group position={position}>
      <Html
        center
        distanceFactor={0.3}
        occlude  // 지구에 가려지도록
      >
        <div style={{ textAlign: 'center' }}>
          {/* SVG 아이콘 */}
          {marker.icon && (
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d={marker.icon} fill={marker.color} />
            </svg>
          )}
          
          {/* 라벨 */}
          {marker.label && (
            <div style={{
              fontSize: '12px',
              marginTop: '4px',
              color: 'white',
              background: 'rgba(0,0,0,0.7)',
              padding: '2px 6px',
              borderRadius: '3px',
              whiteSpace: 'nowrap',
            }}>
              {marker.label}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
```

### 3. Occlusion 처리

**기본 방식**: `occlude` prop 사용

```tsx
<Html occlude>
  {/* 지구나 다른 3D 객체에 자동으로 가려짐 */}
</Html>
```

**고급 최적화**: 지구 반대편 마커는 렌더링하지 않음

```tsx
const isVisible = useMemo(() => {
  const markerPos = lonLatToVector3(marker.position).normalize();
  const cameraDir = camera.position.clone().normalize();
  
  // 내적이 0보다 크면 카메라 쪽을 향함
  return markerPos.dot(cameraDir) > 0;
}, [marker.position, camera.position]);

if (!isVisible) return null;
```

## 성능 고려사항

- **마커 개수**: 50개 이하 권장
- **많은 마커**: 50개 이상이면 PointsFeature 사용 고려
- **최적화**: 
  - 카메라 시점 밖의 마커는 렌더링하지 않음
  - SVG를 Canvas 텍스처로 캐싱 고려 (100개 이상일 때)

## 스타일링 가이드

### 마커 스타일 예시

```tsx
const markerStyle = {
  container: {
    textAlign: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  icon: {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    background: 'rgba(0,0,0,0.8)',
    padding: '4px 8px',
    borderRadius: '4px',
    marginTop: '4px',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
};
```

## 향후 개선 사항

1. **마커 클러스터링**: 가까운 마커들을 그룹화
2. **애니메이션**: 마커 등장/사라짐 효과
3. **커스텀 컴포넌트**: icon 대신 React 컴포넌트 전달
4. **줌 레벨 제어**: 줌 레벨에 따라 마커 표시/숨김

## 참고

- [Html 컴포넌트 문서](https://github.com/pmndrs/drei#html)
- [SVG Path 문법](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [Material Icons SVG Paths](https://fonts.google.com/icons)
