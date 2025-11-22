# RouteFeature 컴포넌트

## 개요

RouteFeature는 3D 지구본 위에 시작점부터 끝점까지 대권항로(Great Circle Route)를 따라 경로를 그리는 컴포넌트입니다. `@react-three/drei`의 `Line` 컴포넌트를 사용하여 간단하고 효율적으로 경로를 렌더링하며, 포물선 형태의 높이 프로필을 적용합니다.

## 인터페이스

```typescript
interface RouteFeatureProps {
  from: Coordinate;        // 시작점 좌표 [경도, 위도]
  to: Coordinate;          // 끝점 좌표 [경도, 위도]
  minHeight: number;       // 최소 높이 (시작점/끝점)
  maxHeight: number;       // 최대 높이 (중간점)
  lineWidth: number;       // 선 너비
  segments?: number;       // 경로 보간 개수 (기본값: 50)
  style?: FeatureStyle;    // 색상, 투명도 등 스타일 옵션
}
```

## 주요 기능

### 1. 대권항로 생성 (SLERP)

시작점(from)에서 끝점(to)까지 구면 상의 최단 경로인 대권항로를 따라 경로 점들 `P = [P1, P2, ..., Pn]`을 생성합니다.

- 점의 개수는 `segments` 파라미터로 제어 (기본값: 50)
- **구면 선형 보간**(Spherical Linear Interpolation, SLERP) 사용

#### SLERP 공식

```typescript
slerp(v1, v2, t) = (sin((1-t)*θ) / sin(θ)) * v1 + (sin(t*θ) / sin(θ)) * v2
```

여기서:
- `θ`: 두 벡터 사이의 각도
- `t`: 보간 파라미터 (0 ~ 1)

#### 구현 코드

```typescript
const pathPoints: Vector3[] = []
const angle = fromVector.angleTo(toVector)

for (let i = 0; i <= segments; i++) {
  const t = i / segments
  const sinAngle = Math.sin(angle)
  
  if (sinAngle < 0.001) {
    // 각도가 너무 작으면 선형 보간 사용
    const point = new Vector3().lerpVectors(fromVector, toVector, t)
    point.normalize().multiplyScalar(globeRadius)
    pathPoints.push(point)
  } else {
    const ratioA = Math.sin((1 - t) * angle) / sinAngle
    const ratioB = Math.sin(t * angle) / sinAngle
    
    const point = new Vector3()
      .addScaledVector(fromVector, ratioA)
      .addScaledVector(toVector, ratioB)
      .normalize()
      .multiplyScalar(globeRadius)
    
    pathPoints.push(point)
  }
}
```

### 2. 높이 프로필 (포물선 프로필)

경로의 각 점은 sin 함수를 사용하여 부드러운 포물선 형태의 높이 프로필을 형성합니다:

- **시작점 P1**: `minHeight`
- **중간점 P[n/2]**: `maxHeight` (최고점)
- **끝점 Pn**: `minHeight`

#### Sin 함수 기반 높이 계산

```typescript
for (let i = 0; i < pathPoints.length; i++) {
  const t = i / segments  // 0 ~ 1로 정규화
  
  // sin(πt)는 0에서 시작해서 0.5에서 최대값 1, 1에서 다시 0
  const heightFactor = Math.sin(t * Math.PI)
  
  const height = minHeight + (maxHeight - minHeight) * heightFactor
  const currentRadius = pathPoints[i].length()
  pathPoints[i].multiplyScalar((currentRadius + height) / currentRadius)
}
```

**높이 적용 방식:**
- 구의 중심에서 방사형으로 높이 적용
- `point * (1 + height)` = 반지름 증가
- 부드러운 포물선 형태로 자연스러운 곡선 생성

### 3. Line 렌더링

`@react-three/drei`의 `Line` 컴포넌트를 사용하여 경로를 렌더링합니다:

```typescript
<Line
  points={pathPoints}           // Vector3[] 배열
  color={appliedStyle.color}    // 선 색상
  lineWidth={lineWidth}         // 선 너비 (픽셀)
  opacity={appliedStyle.fillOpacity}
  transparent={appliedStyle.fillOpacity !== undefined && appliedStyle.fillOpacity < 1}
/>
```

## 구현 특징

### 장점

✅ **간결한 코드**: 157줄로 완결된 구현  
✅ **우수한 성능**: Line 컴포넌트 사용으로 가볍고 빠름  
✅ **유지보수 용이**: 복잡한 메시 생성 로직 없음  
✅ **안정적**: drei의 검증된 컴포넌트 활용  
✅ **충분한 시각화**: 대부분의 경로 표시 용도에 적합

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

**예외 처리:**
```typescript
if (sinAngle < 0.001) {
  // 각도가 너무 작으면 선형 보간 사용
  // (SLERP에서 0으로 나누는 문제 방지)
}
```

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
const pathPoints = useMemo(() => {
  const points = createGreatCirclePath(from, to, segments)
  applyHeightProfile(points, minHeight, maxHeight, segments)
  return points
}, [from, to, minHeight, maxHeight, segments])
```

- `useMemo`로 경로 점 계산 캐싱
- Props 변경 시에만 재계산
- 불필요한 렌더링 방지

## 사용 예시

### 기본 사용

```typescript
<RouteFeature
  from={[126.9780, 37.5665]}  // 서울
  to={[-0.1278, 51.5074]}     // 런던
  minHeight={0.01}
  maxHeight={0.3}
  lineWidth={3}
/>
```

### 스타일 커스터마이징

```typescript
<RouteFeature
  from={[126.9780, 37.5665]}  // 서울
  to={[-74.0060, 40.7128]}    // 뉴욕
  minHeight={0.01}
  maxHeight={0.5}
  lineWidth={5}
  segments={200}
  style={{
    color: '#00CED1',
    fillOpacity: 0.9,
  }}
/>
```

### 낮은 호 (단거리)

```typescript
<RouteFeature
  from={[-122.4194, 37.7749]}  // 샌프란시스코
  to={[-118.2437, 34.0522]}    // 로스앤젤레스
  minHeight={0.005}
  maxHeight={0.05}
  lineWidth={3}
  segments={50}
  style={{
    color: '#FFA500',
  }}
/>
```

### 높은 호 (장거리)

```typescript
<RouteFeature
  from={[151.2093, -33.8688]}  // 시드니
  to={[2.3522, 48.8566]}       // 파리
  minHeight={0.01}
  maxHeight={0.4}
  lineWidth={4}
  segments={150}
  style={{
    color: '#6B5B95',
    fillOpacity: 0.8,
  }}
/>
```

## 파라미터 가이드

### segments (세그먼트 개수)

경로의 부드러움을 결정합니다:

- **50** (기본값): 대부분의 경우 충분
- **100-150**: 장거리 또는 부드러운 곡선 필요 시
- **200+**: 매우 긴 경로나 정밀한 시각화

**주의**: 세그먼트가 많을수록 성능 저하

### minHeight / maxHeight

경로의 높이 범위를 결정합니다:

- **minHeight**: 0.005 ~ 0.02 (시작/끝점 높이)
- **maxHeight**: 0.05 ~ 0.5 (중간점 최고 높이)
- 값이 클수록 경로가 높이 솟아오름

**지구 반지름 대비 상대값**:
- 0.01 = 지구 반지름의 1%
- 0.5 = 지구 반지름의 50%

### lineWidth (선 굵기)

화면에 표시되는 선의 픽셀 너비:

- **2-3**: 얇은 선 (세밀한 경로망)
- **4-5**: 표준 굵기 (단일 경로 강조)
- **6+**: 두꺼운 선 (주요 경로)

**주의**: drei의 Line 컴포넌트는 픽셀 단위 너비 사용

## 참고 자료

- [HyperGlobe 컴포넌트](./hyperglobe-component.md) - 컴포넌트 시스템 구조
- [수학 라이브러리 문서](./math-libraries.md) - OrthographicProj, 좌표 변환
- [RegionFeature 문서](./region-feature.md) - 다른 Feature 컴포넌트 참고
- [@react-three/drei Line](https://github.com/pmndrs/drei#line) - Line 컴포넌트 공식 문서
