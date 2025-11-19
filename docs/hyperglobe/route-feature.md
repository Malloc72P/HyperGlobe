# RouteFeature 컴포넌트

## 개요

RouteFeature는 3D 지구본 위에 시작점부터 끝점까지 대권항로(Great Circle Route)를 따라 입체적인 경로를 그리는 컴포넌트입니다. 경로는 포물선 형태의 높이 프로필과 선형 증가하는 너비 프로필을 가지며, 끝점에 화살촉이 표시됩니다.

## 인터페이스

```typescript
interface RouteFeatureProps {
  from: [longitude, latitude];     // 시작점 좌표
  to: [longitude, latitude];       // 끝점 좌표
  minHeight: number;               // 최소 높이 (시작점/끝점)
  maxHeight: number;               // 최대 높이 (중간점)
  lineWidth: number;               // 최대 선 너비
  minWidth?: number;               // 최소 선 너비 (기본값: lineWidth * 0.3)
  arrowLength: number;             // 화살촉 길이
  arrowWidth: number;              // 화살촉 최대 너비
  segments?: number;               // 경로 보간 개수 (기본값: 50)
  thickness?: number;              // 3D 두께/오프셋 (기본값: 0.01)
  style?: FeatureStyle;            // 색상, 투명도 등 스타일 옵션
}
```

## 주요 기능

### 1. 대권항로 생성

시작점(from)에서 끝점(to)까지 구면 상의 최단 경로인 대권항로를 따라 경로 점들 `P = [P1, P2, ..., Pn]`을 생성합니다.

- 점의 개수는 `segments` 파라미터로 제어
- 구면 선형 보간(Spherical Linear Interpolation, SLERP) 사용

```typescript
const pathPoints: Vector3[] = []
for (let i = 0; i <= segments; i++) {
  const t = i / segments
  const point = slerp(fromVector, toVector, t)
  pathPoints.push(point)
}
```

### 2. 높이 프로필 (삼각형 프로필)

경로의 각 점은 선형적으로 높이가 변화하여 삼각형 프로필을 형성합니다:

- **시작점 P1**: `minHeight`
- **중간점 P[n/2]**: `maxHeight` (최고점)
- **끝점 Pn**: `minHeight`

```typescript
// 전반부 (0 → 중간): 선형 증가
if (i <= midIndex) {
  t = i / midIndex  // 0 → 1
  height = minHeight + (maxHeight - minHeight) * t
}
// 후반부 (중간 → 끝): 선형 감소  
else {
  t = (segments - i) / (segments - midIndex)  // 1 → 0
  height = minHeight + (maxHeight - minHeight) * t
}
```

높이는 구의 중심에서 방사형으로 적용됩니다:
```typescript
point.multiplyScalar(1 + height)  // 반지름 증가
```

### 3. 너비 프로필 (선형 증가)

경로의 너비는 시작점부터 끝점(또는 화살촉 시작점)까지 선형적으로 증가합니다:

- **시작점**: `minWidth` (기본값: `lineWidth * 0.3`)
- **끝점**: `lineWidth`
- 선형 보간으로 각 점의 반너비 `LWi/2` 계산

```typescript
const widthFactor = i / (pathPoints.length - 1)
const width = minWidth + (lineWidth - minWidth) * widthFactor
const halfWidth = width / 2
```

### 4. 경로 폴리곤 구성

각 경로 점 Pi에서 좌우 가장자리 점 Li, Ri를 생성하여 닫힌 폴리곤을 형성합니다.

#### 법선 벡터 계산 (3D 구면)

```typescript
// 1. 진행 방향 (접선 벡터)
const tangent = normalize(Pi+1 - Pi)

// 2. 구면의 반지름 방향 (현재 위치)
const radial = normalize(Pi)

// 3. 이 둘에 수직인 벡터 (외적) - 좌우 방향
const normal = normalize(cross(tangent, radial))
```

#### 가장자리 점 생성

```typescript
// 왼쪽 가장자리
leftEdge[i] = Pi + normal * (LWi / 2)

// 오른쪽 가장자리
rightEdge[i] = Pi - normal * (LWi / 2)
```

#### 닫힌 폴리곤 구성

위에서 봤을 때 다음과 같은 닫힌 폴리곤을 형성합니다:
```
L1 → L2 → ... → Ln → (화살촉) → Rn → ... → R2 → R1 → (닫기)
```

이렇게 생성된 완전히 닫힌 단일 폴리곤은 Delaunator 또는 earcut로 삼각분할할 수 있습니다.

### 5. 화살촉 생성

경로의 마지막 구간 일부를 화살촉으로 변환합니다.

#### 구현 방식: 세그먼트 대체 방식 (Phase 2)

```typescript
// 1. arrowLength에 해당하는 세그먼트 개수 계산
const totalArcLength = calculateArcLength(from, to)
const segmentsForArrow = Math.ceil((arrowLength / totalArcLength) * segments)

// 2. 경로를 두 부분으로 나눔
const bodySegments = segments - segmentsForArrow  // 경로 본체
const arrowSegments = segmentsForArrow             // 화살촉 영역

// 3. 경로 본체 생성 (P1 ~ Pk)
const bodyPoints = pathPoints.slice(0, bodySegments + 1)
// bodyPoints에 대해 좌우 가장자리 생성 (L1~Lk, R1~Rk)

// 4. 화살촉 시작점과 끝점
const arrowStart = pathPoints[bodySegments]  // 화살촉 시작점 (Pk)
const arrowEnd = pathPoints[segments]         // 화살촉 끝점 (Pn)

// 5. 화살촉 시작점에서의 법선 벡터
const arrowTangent = normalize(arrowEnd - arrowStart)
const arrowRadial = normalize(arrowStart)
const arrowNormal = cross(arrowTangent, arrowRadial)

// 6. 화살촉 베이스 점들
const arrowLeftBase = arrowStart + arrowNormal * (arrowWidth / 2)
const arrowRightBase = arrowStart - arrowNormal * (arrowWidth / 2)
const arrowTip = arrowEnd  // Pn

// 7. 닫힌 폴리곤 결합
const polygon = [
  ...bodyLeftEdge,           // L1 → L2 → ... → Lk
  arrowLeftBase,             // 화살촉 왼쪽 베이스
  arrowTip,                  // Pn (화살촉 끝)
  arrowRightBase,            // 화살촉 오른쪽 베이스
  ...bodyRightEdge.reverse() // Rk → ... → R2 → R1
]
```

#### 화살촉 구조

```
위에서 본 모습:
    
    Lk -------- arrowLeftBase
     |              \
     |               \
     |                arrowTip (Pn)
     |               /
     |              /
    Rk -------- arrowRightBase
```

**특징**:
- **화살촉 끝점**: Pn (경로의 실제 도착점)
- **화살촉 베이스**: arrowWidth 너비를 가짐
- **삼각형 형태**: 3개 점(왼쪽 베이스, 끝점, 오른쪽 베이스)으로 구성

**주의사항**:
- 경로 본체의 마지막 너비(Lk-Rk 간격)와 arrowWidth가 다를 경우 불연속 발생 가능
- 이는 Phase 3에서 하이브리드 방식으로 개선 가능

### 6. 3D 지오메트리

입체적인 경로를 만들기 위해 윗면, 아랫면, 측면을 생성합니다:

#### 윗면 (Top Surface)
- Li, Ri 좌표들로 구성된 닫힌 폴리곤
- 각 점의 높이 프로필 적용됨
- 삼각분할(Triangulation)로 메쉬 생성

```typescript
// 닫힌 폴리곤 구성
const polygon = [...leftEdge, ...rightEdge.reverse()]

// 3D 폴리곤을 2D로 투영 후 삼각분할
const indices = triangulate(polygon)
```

#### 아랫면 (Bottom Surface)
- 윗면의 각 점을 구면 중심 방향으로 `thickness`만큼 이동
- 기본값: 0.01 (지구 반지름 대비 상대값)

```typescript
bottomPoint = topPoint.clone().multiplyScalar(1 - thickness)
```

#### 측면 (Side Surfaces)
- 윗면과 아랫면의 가장자리를 연결
- RegionFeature의 extrusion 로직 재활용
  - 윗면 폴리곤의 각 선분과 아랫면의 대응 선분을 사각형으로 연결
  - 각 사각형을 2개의 삼각형으로 분할

## 구현 단계

### Phase 1: 기본 경로 구현 (화살촉 제외)

#### 1단계: 기본 구조 및 인터페이스
- [x] RouteFeature 컴포넌트 파일 생성
- [x] Props 인터페이스 완성
- [x] 기본값 설정 (minWidth, segments, thickness)

#### 2단계: 대권항로 생성
- [x] from → to 대권항로 생성
- [x] SLERP 구현 (Three.js lerpVectors 사용)
- [x] segments 개수만큼 경로 점 P 생성

#### 3단계: 높이 프로필 적용
- [x] 삼각형 높이 프로필 계산 (선형 증가 → 선형 감소)
- [x] 중간점 인덱스 계산
- [x] 각 점에 반지름 방향으로 높이 적용

#### 4단계: 너비 프로필 및 가장자리 생성
- [x] 선형 너비 증가 계산
- [x] 각 점에서 진행 방향(tangent) 계산
- [x] 법선 벡터(normal) 계산 - cross(tangent, radial)
- [x] 좌우 가장자리 점 L, R 생성
- [x] 닫힌 폴리곤 구성

#### 5단계: 3D 지오메트리 생성
- [x] 윗면 폴리곤 삼각분할 (임시: fan triangulation)
- [x] 아랫면 생성 (thickness 오프셋)
- [x] 측면 생성 (직접 구현)
- [x] BufferGeometry 구성

#### 6단계: 렌더링 및 검증
- [x] Three.js Mesh 생성
- [x] 기본 머티리얼 적용
- [x] Storybook 스토리 작성
- [ ] 실제 렌더링 테스트 및 버그 수정
- [ ] Three.js Mesh 생성
- [ ] 기본 머티리얼 적용
- [ ] 테스트 데이터로 렌더링 검증
- [ ] 버그 수정 및 최적화

### Phase 2: 화살촉 구현

#### 7단계: 화살촉 추가 (세그먼트 대체 방식)
- [ ] 전체 대권 호장 길이 계산
- [ ] arrowLength에 해당하는 세그먼트 개수 계산
- [ ] 경로를 본체와 화살촉 영역으로 분리
- [ ] 화살촉 시작점에서 법선 벡터 계산
- [ ] 화살촉 베이스 점 생성 (arrowWidth 적용)
- [ ] 화살촉 끝점 (Pn) 추가
- [ ] 경로 본체와 화살촉을 결합하여 닫힌 폴리곤 구성
- [ ] 삼각분할 및 렌더링 검증

#### 8단계: 화살촉 높이 처리
- [ ] 화살촉 영역의 높이 프로필 결정
  - 화살촉 시작점 높이
  - 화살촉 끝점 높이 (minHeight로 유지)
- [ ] 화살촉 베이스 점들에 높이 적용
- [ ] 3D 지오메트리 업데이트

### Phase 3: 고도화

#### 9단계: 스타일링 및 최적화
- [ ] FeatureStyle 통합
- [ ] useMemo로 지오메트리 캐싱
- [ ] 성능 테스트 및 최적화

#### 10단계: 화살촉 개선 (선택사항)
- [ ] 하이브리드 방식으로 전환 (부드러운 너비 전환)
- [ ] 경로 본체와 화살촉 간 너비 불연속 해결
- [ ] 화살촉 형태 커스터마이징 옵션 추가

#### 11단계: 문서화 및 예제
- [ ] Storybook 스토리 작성
- [ ] 사용 예제 추가
- [ ] API 문서 작성

## 기술적 고려사항

### 수학적 계산

1. **대권항로 (Great Circle)**
   - 구면 상의 두 점을 잇는 최단 경로
   - SLERP(Spherical Linear Interpolation) 사용
   - @hyperglobe/tools에 구현 여부 확인 필요

2. **법선 벡터 계산 (안정적)**
   ```typescript
   // 3D 구면에서의 법선 계산
   tangent = normalize(Pi+1 - Pi)     // 진행 방향
   radial = normalize(Pi)              // 반지름 방향
   normal = cross(tangent, radial)     // 좌우 방향
   ```
   - 이 방식은 안정적이며 특별한 경우 처리 불필요
   - 극점 근처에서도 작동

3. **높이 적용 (방사형)**
   - 구의 중심에서 바깥쪽으로 높이 적용
   - `position = spherePoint * (1 + height)`
   - 삼각형 프로필: 선형 증가 → 선형 감소

### 삼각분할 전략

**닫힌 폴리곤**이므로 Delaunator나 earcut 사용 가능:

- **Delaunator**: 빠르지만 convex hull만 처리
- **earcut**: 비볼록(non-convex) 폴리곤도 처리, 구멍 지원

화살촉 추가 시 폴리곤이 비볼록 형태가 되므로 **earcut 권장**

**3D → 2D 투영 필요**:
```typescript
// 폴리곤의 평균 법선 계산
// 로컬 좌표계로 변환하여 2D 좌표 추출
// 삼각분할 후 다시 3D로 변환
```

### 성능 최적화

- `useMemo`로 지오메트리 캐싱
- Props 변경 시에만 재계산
- 적절한 segments 개수 선택:
  - 기본값 50: 대부분의 경우 충분
  - 100개: 약 200 삼각형 (윗면 + 아랫면 + 측면)
  - 여러 경로 동시 렌더링 시 성능 고려

### 재사용 가능한 유틸리티

- **RegionFeature의 extrusion 로직**: 윗면-아랫면 연결
- **@hyperglobe/tools**: SLERP, 좌표 변환, 구면 계산
- **earcut**: 볼록하지 않은 폴리곤. 삼각분할

## 사용 예시

```typescript
<RouteFeature
  from={[126.9780, 37.5665]}  // 서울
  to={[-0.1278, 51.5074]}     // 런던
  minHeight={0.01}
  maxHeight={0.3}
  lineWidth={0.02}
  arrowLength={0.05}
  arrowWidth={0.04}
  segments={100}
  style={{
    color: '#4A90E2',
    opacity: 0.8
  }}
/>
```

## 참고 자료

- [RegionFeature 문서](./region-feature.md) - extrusion 구현 참고
- [수학 라이브러리 문서](./math-libraries.md) - 좌표 변환 및 지오메트리
- [HyperGlobe 컴포넌트](./hyperglobe-component.md) - 컴포넌트 시스템 구조
