# RouteFeature 컴포넌트

## 개요

3D 지구본 위에 대권항로(Great Circle Route)를 따라 경로를 그리는 컴포넌트입니다. 포물선 형태의 높이 프로필을 적용합니다.

**파일**: `packages/hyperglobe/src/components/route-feature/`

**사용 예시**: Storybook의 `RouteFeature` 스토리 참조

### 주요 기능

- SLERP 기반 대권항로 생성
- 포물선 높이 프로필
- 애니메이션 지원
- 시작점/끝점 마커 표시

## Props

**타입 정의**: `packages/hyperglobe/src/types/hyperglobe-props.ts` (`RouteConfig`)

> **상세 Props**: 타입 정의 파일 또는 Storybook 참조

## 구현 원리

### 1. 대권항로 생성 (SLERP)

구면 선형 보간(Spherical Linear Interpolation)으로 최단 경로 생성:
- `segments` 파라미터로 점의 개수 제어 (기본: 500)
- `@hyperglobe/tools`의 `createGreatCirclePath` 사용

### 2. 높이 프로필 (포물선)

Sin 함수로 부드러운 포물선 형태 생성:
- 시작/끝: `minHeight`
- 중간: `maxHeight`
- 공식: `height = minHeight + (maxHeight - minHeight) * sin(πt)`

### 3. 애니메이션

`Line` 컴포넌트의 `instanceCount` 조절로 구현:
- 진행률에 따라 `instanceCount` 증가
- 화살촉(ConeGeometry)이 선두에서 이동
- HGM 로딩 완료 후 시작

### 4. MarkerFeature 통합

`from`/`to`에 `label` 설정 시 자동으로 마커 렌더링

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [MarkerFeature](./marker-feature.md)

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
  ...CoordinateConverter.convert(from, globeRadius)
)
```

`CoordinateConverter.convert()`:
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
