# RouteFeature 컴포넌트

## 개요

RouteFeature는 3D 지구본 위에 시작점부터 끝점까지 대권항로(Great Circle Route)를 따라 경로를 그리는 컴포넌트입니다. `@react-three/drei`의 `Line` 컴포넌트를 사용하여 간단하고 효율적으로 경로를 렌더링하며, 포물선 형태의 높이 프로필을 적용합니다.

## 사용법

`HyperGlobe` 컴포넌트의 `routes` prop을 사용합니다:

```tsx
import { HyperGlobe } from 'hyperglobe';

function FlightRoutes() {
  const routes = [
    {
      id: 'seoul-london',
      from: {
        coordinate: [126.978, 37.5665],
        label: '서울',
        style: { fill: '#3B82F6' },
      },
      to: {
        coordinate: [-0.1278, 51.5074],
        label: '런던',
        style: { fill: '#3B82F6' },
      },
      maxHeight: 0.3,
      lineWidth: 3,
      animationDuration: 2000,
    },
    {
      id: 'seoul-newyork',
      from: { coordinate: [126.978, 37.5665] },
      to: { coordinate: [-74.006, 40.7128], label: '뉴욕' },
      maxHeight: 0.4,
      lineWidth: 3,
      animationDelay: 500,
    },
  ];

  return (
    <HyperGlobe
      hgmUrl="/maps/nations-mid.hgm"
      routes={routes}
    />
  );
}
```

## 인터페이스

```typescript
interface RoutePoint {
  coordinate: Coordinate;  // 좌표 [경도, 위도]
  label?: string;          // 마커 라벨 (설정 시 MarkerFeature 렌더링)
  style?: SvgStyle;        // 마커 스타일
}

interface RouteFeatureProps {
  from: RoutePoint;              // 시작점 정보
  to: RoutePoint;                // 끝점 정보
  maxHeight: number;             // 최대 높이 (중간점)
  lineWidth: number;             // 선 너비
  segments?: number;             // 경로 보간 개수 (기본값: 500)
  style?: FeatureStyle;          // 색상, 투명도 등 스타일 옵션
  animated?: boolean;            // 애니메이션 활성화 여부 (기본값: true)
  animationDuration?: number;    // 애니메이션 지속 시간 (밀리초, 기본값: 1000)
  animationDelay?: number;       // 애니메이션 시작 딜레이 (밀리초, 기본값: 0)
  objectScale?: number;          // 도형 크기 스케일 (기본값: 1)
}
```

> **참고**: `minHeight`는 내부적으로 `UiConstant.feature.strokeRadius - 1`로 고정되어 있습니다.

## 주요 기능

### 1. 대권항로 생성 (SLERP)

시작점(from)에서 끝점(to)까지 구면 상의 최단 경로인 대권항로를 따라 경로 점들 `P = [P1, P2, ..., Pn]`을 생성합니다.

- 점의 개수는 `segments` 파라미터로 제어 (기본값: 500)
- **구면 선형 보간**(Spherical Linear Interpolation, SLERP) 사용

#### SLERP 공식

```typescript
slerp(v1, v2, t) = (sin((1-t)*θ) / sin(θ)) * v1 + (sin(t*θ) / sin(θ)) * v2
```

여기서:
- `θ`: 두 벡터 사이의 각도
- `t`: 보간 파라미터 (0 ~ 1)

### 2. 높이 프로필 (포물선 프로필)

경로의 각 점은 sin 함수를 사용하여 부드러운 포물선 형태의 높이 프로필을 형성합니다:

- **시작점 P1**: `minHeight`
- **중간점 P[n/2]**: `maxHeight` (최고점)
- **끝점 Pn**: `minHeight`

```typescript
// sin(πt)는 0에서 시작해서 0.5에서 최대값 1, 1에서 다시 0
const heightFactor = Math.sin(t * Math.PI);
const height = minHeight + (maxHeight - minHeight) * heightFactor;
```

### 3. Line 렌더링 및 애니메이션

`@react-three/drei`의 `Line` 컴포넌트를 사용하여 경로를 렌더링합니다.

#### 애니메이션 동작 원리

- `Line` 컴포넌트의 `geometry.instanceCount`를 조절하여 그릴 세그먼트 수를 제어
- 애니메이션 시작 시 `instanceCount`를 0으로 설정하고, 진행률에 따라 점차 증가
- 경로의 선두에는 헤드(mesh)가 함께 이동하며, 회전 행렬을 사용해 진행 방향을 바라봄

### 4. MarkerFeature 통합

`from` 또는 `to`에 `label`이 설정된 경우, 해당 지점에 `MarkerFeature`가 자동으로 렌더링됩니다.

## 파라미터 가이드

### segments (세그먼트 개수)

경로의 부드러움을 결정합니다:

- **500** (기본값): 부드러운 애니메이션을 위한 기본값
- **100-200**: 짧은 거리나 성능이 중요한 경우
- **1000+**: 매우 긴 경로나 극도로 정밀한 시각화

### maxHeight

경로의 최고점 높이를 결정합니다:

- **0.05 ~ 0.1**: 낮은 호 (단거리)
- **0.2 ~ 0.3**: 표준 높이 (중거리)
- **0.4 ~ 0.5**: 높은 호 (장거리)

**지구 반지름 대비 상대값**:
- 0.01 = 지구 반지름의 1%
- 0.5 = 지구 반지름의 50%

### lineWidth (선 굵기)

화면에 표시되는 선의 픽셀 너비:

- **2-3**: 얇은 선 (세밀한 경로망)
- **4-5**: 표준 굵기 (단일 경로 강조)
- **6+**: 두꺼운 선 (주요 경로)

### 애니메이션 관련 파라미터

#### animationDuration (밀리초)

경로를 완전히 그리는데 걸리는 시간:

- **500**: 빠른 애니메이션
- **1000** (기본값): 표준 속도
- **2000+**: 느린 애니메이션

#### animationDelay (밀리초)

애니메이션 시작 전 대기 시간. 여러 경로를 순차적으로 그릴 때 유용:

```tsx
// 순차적 경로 그리기
routes={routes.map((route, index) => ({
  ...route,
  animationDuration: 1000,
  animationDelay: (index + 1) * 1000 + 200,
}))}
```

## 구현 특징

### 장점

✅ **간결한 코드**: 핵심 로직이 훅으로 분리되어 가독성 높음  
✅ **우수한 성능**: Line 컴포넌트 사용으로 가볍고 빠름  
✅ **유지보수 용이**: 복잡한 메시 생성 로직 없음  
✅ **안정적**: drei의 검증된 컴포넌트 활용  
✅ **애니메이션 지원**: 경로를 점진적으로 그리는 애니메이션 내장  
✅ **마커 통합**: 시작/끝점에 자동 마커 표시

### 제한사항

- 3D 입체감 없음 (선만 표시)
- 화살촉 미지원
- 너비 프로필 미지원 (일정한 굵기)

## 기술적 세부사항

### SLERP (Spherical Linear Interpolation)

구면 상의 두 점을 잇는 최단 경로를 계산하는 알고리즘입니다.

**왜 일반 선형 보간이 아닌가?**
- 일반 선형 보간: 두 점을 직선으로 연결 → 구 내부를 통과
- SLERP: 구면을 따라 부드럽게 이동 → 대권항로 형성

### 좌표 변환

경도/위도 좌표를 3D 공간의 벡터로 변환:

```typescript
const fromVector = new Vector3(
  ...OrthographicProj.project(from, globeRadius)
)
```

`OrthographicProj.project()`:
- 입력: `[경도, 위도]`, 반지름
- 출력: `[x, y, z]` 3D 좌표
- `@hyperglobe/tools` 패키지에서 제공

### 성능 최적화

```typescript
const fullPathPoints = useMemo(() => {
  const points = createGreatCirclePath(from, to, segments)
  applyHeight(points, minHeight, maxHeight, segments)
  return points
}, [from, to, minHeight, maxHeight, segments])
```

- `useMemo`로 경로 점 계산 캐싱
- Props 변경 시에만 재계산

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [MarkerFeature 컴포넌트](./marker-feature.md)
- [수학 라이브러리](./math-libraries.md)
