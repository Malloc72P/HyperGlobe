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
1. **SVG 아이콘**: 미리 정의된 아이콘(pin, circle) 또는 커스텀 SVG Path로 다양한 마커 모양 표현
2. **텍스트 라벨**: 마커 아래에 라벨 표시
3. **자동 Billboard**: 항상 카메라를 향하도록 회전
4. **Occlusion**: 지구 반대편에서 자동으로 가려짐 (내적 기반 가시성 계산)

## Props 설계

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

### MarkerData 인터페이스

```typescript
export interface MarkerData {
  /** 마커 위치 [경도, 위도] */
  coordinate: Coordinate;
  
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
  data?: any;
}
```

### MarkerFeatureProps 인터페이스

`MarkerFeatureProps`는 `MarkerData`를 확장하여 단일 마커를 표시합니다.

```typescript
export interface MarkerFeatureProps extends MarkerData {
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
  return (
    <HyperGlobe>
      <MarkerFeature
        coordinate={[126.978, 37.5665]} // 서울 [경도, 위도]
        label="서울"
        icon="pin"
        style={{ fill: '#ff0000', stroke: 'black' }}
      />
      <MarkerFeature
        coordinate={[139.6503, 35.6762]} // 도쿄
        label="도쿄"
        icon="circle"
        style={{ fill: '#0000ff' }}
      />
    </HyperGlobe>
  );
}
```

### 커스텀 SVG 아이콘

```tsx
<MarkerFeature
  coordinate={[126.978, 37.5665]}
  label="서울"
  icon="custom"
  // Material Icons의 location_on 아이콘
  iconPath="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
  style={{ fill: '#ff5722', stroke: 'black' }}
  scale={1.5}
/>
```

### 이벤트 처리

```tsx
function App() {
  const handleMarkerClick = (marker: MarkerData) => {
    console.log('Clicked:', marker.label);
  };

  return (
    <HyperGlobe>
      <MarkerFeature
        coordinate={[126.978, 37.5665]}
        label="서울"
        onMarkerClick={handleMarkerClick}
      />
    </HyperGlobe>
  );
}
```

## 구현 세부사항

### 1. 좌표 변환

경위도 → 3D 카르테시안 좌표:

```typescript
import { OrthographicProj } from '@hyperglobe/tools';

// coordinate: [경도, 위도]
const coords = OrthographicProj.project(coordinate, 1);
const position = new THREE.Vector3(coords[0], coords[1], coords[2]);
```

### 2. Html 컴포넌트 사용

```tsx
import { Html } from '@react-three/drei';

function MarkerFeature({ coordinate, icon, iconPath, label, style, ... }: MarkerFeatureProps) {
  const position = useMemo(() => {
    const coords = OrthographicProj.project(coordinate, 1);
    return new THREE.Vector3(coords[0], coords[1], coords[2]);
  }, [coordinate]);

  return (
    <group position={position}>
      <Html center>
        <div style={{ textAlign: 'center' }}>
          {/* SVG 아이콘 */}
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24">
            <path d={iconShape} fill={style?.fill} stroke={style?.stroke} />
          </svg>
          
          {/* 라벨 */}
          {showLabels && label && (
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'white',
              background: 'rgba(0,0,0,0.8)',
              padding: '4px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}>
              {label}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
```

### 3. 아이콘 타입 처리

`useMarkerShape` 훅을 사용하여 아이콘 타입에 따른 SVG path를 결정합니다.

```typescript
// marker-constant.ts
export const PIN_ICON = `M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`;
export const CIRCLE_ICON = `M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16z`;

// use-marker-shape.ts
function useMarkerShape({ icon, iconPath }) {
  const iconShape = useMemo(() => {
    switch (icon) {
      case 'pin': return PIN_ICON;
      case 'circle': return CIRCLE_ICON;
      case 'custom': return iconPath;
      default: return PIN_ICON;
    }
  }, [icon, iconPath]);

  return [iconShape];
}
```

### 4. Occlusion 처리 (가시성 계산)

`useFrame`을 사용하여 매 프레임마다 마커의 가시성을 계산합니다.
지구 반대편에 있는 마커는 렌더링하지 않습니다.

```tsx
useFrame(() => {
  // 마커 방향 벡터 (원점 → 마커)
  const markerDir = position.clone().normalize();

  // Globe의 Y축 회전을 마커 벡터에 적용 (월드 좌표계로 변환)
  const rotationEuler = new THREE.Euler(...UiConstant.globe.rotation);
  markerDir.applyEuler(rotationEuler);

  // 카메라 방향 벡터
  const cameraDir = camera.position.clone().normalize();

  // 내적 계산: 두 벡터가 이루는 각도의 코사인 값
  const dotProduct = markerDir.dot(cameraDir);

  // 내적 > 0.1: 같은 반구 (보임)
  // 0.1을 임계값으로 사용하여 경계에서 깜빡임 방지
  setIsVisible(dotProduct > 0.1);
});

if (!isVisible) return null;
```

## 성능 고려사항

- **마커 개수**: 50개 이하 권장
- **많은 마커**: 50개 이상이면 PointsFeature 사용 고려
- **최적화**: 
  - 카메라 시점 밖의 마커는 렌더링하지 않음
  - SVG를 Canvas 텍스처로 캐싱 고려 (100개 이상일 때)

## 스타일링 가이드

### SvgStyle을 사용한 스타일링

```tsx
<MarkerFeature
  coordinate={[126.978, 37.5665]}
  label="서울"
  icon="pin"
  style={{
    fill: '#ff5722',        // 채우기 색상
    stroke: 'black',        // 선 색상
    strokeWidth: 1,         // 선 두께
    scale: 1.5,             // 크기 비율
  }}
/>
```

### CSS 스타일 (컴포넌트 내부 적용)

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
├── marker-feature.stories.tsx      # Storybook 스토리
└── marker-feature-story.tsx        # 스토리용 래퍼 컴포넌트
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
