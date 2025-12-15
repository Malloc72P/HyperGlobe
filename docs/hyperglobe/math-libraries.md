# 수학 및 지오메트리 라이브러리

## 개요

HyperGlobe에서 지리 데이터 3D 시각화에 사용하는 수학/지오메트리 라이브러리 참고 문서입니다.

**파일**: `packages/hyperglobe-tools/src/`

## @hyperglobe/tools 패키지

HyperGlobe 프로젝트의 수학/지오메트리 유틸리티 패키지입니다.

> 상세 API: `packages/hyperglobe-tools/src/` 참고

### 주요 유틸리티

**수학 (math/)**:
- `toRadian`: 도 → 라디안 변환
- `magnitude2D/3D`: 벡터 크기 계산
- `distance2D`: 2D 거리 계산
- `roundCoordinates`: 좌표 반올림
- `calcProgress`: 애니메이션 진행률 계산

**좌표 변환 (coordinate/)**:
- `CoordinateConverter.convert`: 경위도 → 3D 직교좌표
- `CoordinateConverter.converts`: 다중 좌표 변환

**지오메트리 (geometry/)**:

#### CoordinateConverter.convert(coordinate, radius)
경위도 좌표를 3D 직교좌표계로 변환합니다.

```typescript
import { CoordinateConverter } from '@hyperglobe/tools';

// 경도 0도, 위도 0도 (아프리카 기니만)
CoordinateConverter.convert([0, 0]);
// → [1, 0, 0]

// 경도 90도, 위도 0도
CoordinateConverter.convert([90, 0]);
// → [0, 0, 1]

// 북극점
CoordinateConverter.convert([0, 90]);
// → [0, 1, 0]
```

**변환 공식:**
```
x = cos(φ) * cos(λ) * radius
y = sin(φ) * radius
z = cos(φ) * sin(λ) * radius

여기서:
  φ (phi): 위도 (라디안)
  λ (lambda): 경도 (라디안)
```

**사용처:**
- GeoJSON → 3D 메시 변환
- 지구본 표면 좌표 계산

#### CoordinateConverter.converts(coordinates, radius)
여러 경위도 좌표를 한 번에 3D 직교좌표계로 변환합니다.

```typescript
CoordinateConverter.converts([[0, 0], [90, 0], [0, 90]]);
// → [[1, 0, 0], [0, 0, 1], [0, 1, 0]]
```

**사용처:**
- 다중 좌표 일괄 변환
- 폴리곤 경계선 변환

#### CoordinateConverter.invert(vector, radius)
3D 직교좌표를 경위도로 역변환합니다.

```typescript
CoordinateConverter.invert([1, 0, 0]);
// → [0, 0] (경도 0도, 위도 0도)
```

**사용처:**
- 마우스 피킹 결과 변환
- 3D 위치 → 지리 좌표

### 폴리곤 처리 (polygon/)

#### delaunayTriangulate(options)
폴리곤을 Delaunay 삼각분할합니다. 내부적으로 `delaunator` 라이브러리를 사용합니다.

```typescript
import { delaunayTriangulate } from '@hyperglobe/tools';

const polygon = [
  [127.0, 37.5],
  [128.0, 37.5],
  [128.0, 38.5],
  [127.0, 38.5]
];

const result = delaunayTriangulate({
  outerRing: polygon,
  holes: [],  // 홀(구멍) 배열 (선택사항)
});
// {
//   vertices: Float32Array,  // 3D 좌표 [x,y,z,x,y,z,...]
//   indices: Uint32Array     // 삼각형 인덱스
// }
```

**특징:**
- 2D 폴리곤을 3D 구면으로 투영
- 홀(hole) 처리 지원
- 최적화된 삼각분할

**사용처:**
- RegionFeature의 메시 생성
- 복잡한 폴리곤 렌더링

#### triangulatePolygon(polygon)
일반적인 폴리곤 삼각분할을 수행합니다.

**사용처:**
- 단순 폴리곤 처리
- Delaunay가 필요 없는 경우

#### isPointInPolygon(point, polygon)
점이 폴리곤 내부에 있는지 판정합니다. Ray-casting 알고리즘을 사용합니다.

```typescript
import { isPointInPolygon } from '@hyperglobe/tools';

const point = [127.5, 37.5];
const polygon = [
  [127.0, 37.0],
  [128.0, 37.0],
  [128.0, 38.0],
  [127.0, 38.0]
];

isPointInPolygon(point, polygon);  // true
```

**알고리즘:** Ray-casting
- 점에서 무한대로 광선을 쏘아 교차 횟수 확인
- 홀수 번 교차 → 내부
- 짝수 번 교차 → 외부

**사용처:**
- 마우스 호버 감지
- 지역 찾기

#### findRegionByVector(vector, regions)
3D 벡터(마우스 피킹 결과)에 해당하는 지역을 찾습니다.

```typescript
import { findRegionByVector } from '@hyperglobe/tools';

const vector = [0.5, 0.5, 0.7];
const region = findRegionByVector(vector, allRegions);
```

**사용처:**
- 마우스 인터랙션
- 클릭/호버 이벤트 처리

### 지오메트리 유틸리티 (geo/)

#### getBoundingBox(coordinates)
좌표 배열에서 경계 상자(Bounding Box)를 계산합니다.

```typescript
import { getBoundingBox } from '@hyperglobe/tools';

const coords = [
  [127.0, 37.0],
  [128.0, 37.5],
  [127.5, 38.0]
];

getBoundingBox(coords);
// {
//   min: { x: 127.0, y: 37.0 },
//   max: { x: 128.0, y: 38.0 }
// }
```

**사용처:**
- 뷰포트 계산
- 충돌 감지 최적화
- 가시성 판정

#### toRegionBBox(region)
지역 객체에서 경계 상자를 추출합니다.

**사용처:**
- 지역 단위 경계 계산
- 카메라 포커스

#### createGreatCirclePath(from, to, segments)
두 경위도 좌표 사이의 대권항로(Great Circle Path)를 생성합니다. SLERP(Spherical Linear Interpolation)를 사용하여 구면을 따라 최단 경로를 계산합니다.

```typescript
import { createGreatCirclePath } from '@hyperglobe/tools';

// 서울에서 뉴욕까지 대권항로 생성
const seoul = [126.9780, 37.5665];
const newYork = [-74.0060, 40.7128];
const path = createGreatCirclePath(seoul, newYork, 100);
// Vector3[] - 100개의 세그먼트로 이루어진 경로 점들
```

**특징:**
- SLERP 알고리즘으로 정확한 구면 보간
- 두 점이 매우 가까울 경우 선형 보간으로 폴백
- Three.js Vector3 배열 반환

**사용처:**
- RouteFeature의 비행 경로 생성
- 두 지점 간 최단 거리 경로

#### applyHeight(pathPoints, minHeight, maxHeight, segments)
경로 점들에 높이 프로필을 적용합니다. Sin 함수를 사용하여 부드러운 포물선 형태의 높이를 만듭니다.

```typescript
import { applyHeight } from '@hyperglobe/tools';

const pathPoints = createGreatCirclePath(seoul, newYork, 100);
applyHeight(pathPoints, 0.01, 0.1, 100);
// pathPoints가 in-place로 수정됨
// 경로 중간이 가장 높고 양 끝이 낮은 포물선 형태
```

**높이 공식:**
```
heightFactor = sin(π × t)  // t: 0~1 진행률
height = minHeight + (maxHeight - minHeight) × heightFactor
```

**사용처:**
- 비행 경로의 고도 표현
- 부드러운 곡선 경로 생성

### 안전한 값 처리 (safe-value/)

#### isSafeNumber(value)
값이 안전한 숫자인지 확인합니다. `Number.isFinite()`를 사용하여 NaN, Infinity를 제외합니다.

```typescript
import { isSafeNumber } from '@hyperglobe/tools';

isSafeNumber(42);        // true
isSafeNumber(NaN);       // false
isSafeNumber(Infinity);  // false
isSafeNumber(null);      // false
isSafeNumber('42');      // false (문자열은 숫자가 아님)
```

**사용처:**
- 컬러스케일 값 검증
- 데이터 유효성 검사
- 타입 가드

#### resolveNumber(value, fallback)
값이 유효하지 않으면 fallback을 반환합니다. `null`, `undefined`, `NaN`, `Infinity`를 모두 처리합니다.

```typescript
import { resolveNumber } from '@hyperglobe/tools';

resolveNumber(42, 0);        // 42
resolveNumber(NaN, 0);       // 0
resolveNumber(Infinity, 0);  // 0
resolveNumber(null, 100);    // 100
resolveNumber(undefined, 0); // 0
```

**사용처:**
- 기본값 설정
- 안전한 계산

### 상수 (constants/)

#### MathConstants
렌더링에 사용되는 Z-인덱스 상수를 제공합니다.

```typescript
import { MathConstants } from '@hyperglobe/tools';

// 피쳐 외곽선의 Z-인덱스 (구체보다 위, 면보다 위)
MathConstants.FEATURE_STROKE_Z_INDEX  // 1.0035

// 피쳐 면(메쉬)의 Z-인덱스 (구체보다 위, 외곽선보다 아래)
MathConstants.FEATURE_FILL_Z_INDEX    // 1.003
```

**사용처:**
- Z-fighting 방지
- 렌더링 순서 제어

## Three.js 라이브러리

### 지오메트리 클래스

#### BufferGeometry
최적화된 지오메트리 표현 방식입니다. 정점 데이터를 GPU 메모리에 직접 저장합니다.

```typescript
import * as THREE from 'three';

const geometry = new THREE.BufferGeometry();

// 정점 위치 설정
const vertices = new Float32Array([
  0, 0, 0,  // 정점 1
  1, 0, 0,  // 정점 2
  0, 1, 0   // 정점 3
]);
geometry.setAttribute('position', 
  new THREE.Float32BufferAttribute(vertices, 3)
);

// 인덱스 설정 (삼각형 정의)
geometry.setIndex([0, 1, 2]);

// 법선 벡터 자동 계산
geometry.computeVertexNormals();
```

**장점:**
- 메모리 효율적
- 렌더링 속도 빠름
- GPU 친화적

**사용처:**
- RegionFeature 메시
- 모든 3D 오브젝트

#### mergeGeometries(geometries)
여러 지오메트리를 하나로 병합합니다. 드로우콜을 줄여 성능을 크게 향상시킵니다.

```typescript
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const geo1 = createGeometry1();
const geo2 = createGeometry2();
const geo3 = createGeometry3();

const merged = mergeGeometries([geo1, geo2, geo3]);
// 드로우콜 3회 → 1회로 감소
```

**사용처:**
- 여러 지역을 하나의 메시로 병합
- RegionFeature의 폴리곤 병합

### 버퍼 어트리뷰트

#### Float32BufferAttribute
32비트 부동소수점 배열을 BufferGeometry의 속성으로 사용합니다.

```typescript
// 정점 위치 (x, y, z)
const positions = new THREE.Float32BufferAttribute(vertices, 3);
geometry.setAttribute('position', positions);

// 법선 벡터 (nx, ny, nz)
const normals = new THREE.Float32BufferAttribute(normalData, 3);
geometry.setAttribute('normal', normals);
```

**매개변수:**
- 첫 번째: TypedArray (Float32Array 등)
- 두 번째: itemSize (요소당 값 개수)

### 법선 계산

#### computeVertexNormals()
정점 법선 벡터를 자동으로 계산합니다. 라이팅(조명) 계산에 필수적입니다.

```typescript
geometry.computeVertexNormals();
```

**작동 원리:**
1. 각 삼각형의 면 법선 계산
2. 정점을 공유하는 면들의 법선을 평균화
3. 정규화 (길이 1로 만듦)

**사용처:**
- 모든 3D 메시
- 라이팅 효과

## 외부 라이브러리

### Delaunator

고성능 2D Delaunay 삼각분할 라이브러리입니다.

```typescript
import Delaunator from 'delaunator';

const points = [
  [0, 0], [1, 0], [1, 1], [0, 1]
];

// 좌표를 flat 배열로 변환
const coords = points.flatMap(p => p);  // [0,0,1,0,1,1,0,1]

const delaunay = Delaunator.from(points);
const triangles = delaunay.triangles;
// [0, 1, 2, 0, 2, 3] (삼각형 2개)
```

**특징:**
- 매우 빠름 (평균 O(n log n))
- 최적화된 삼각형 생성
- 품질 보장 (가늘고 긴 삼각형 최소화)

**사용처:**
- `delaunayTriangulate` 함수 내부
- 복잡한 폴리곤 렌더링

## HyperGlobe 내부 구현

### createSideGeometry(options)

폴리곤의 측면(extrusion) 지오메트리를 생성합니다.

```typescript
import { createSideGeometry } from 'hyperglobe/lib/geometry';

const sideGeometry = createSideGeometry({
  borderLines: feature.borderLines,
  extrusionDepth: 0.001
});
```

**옵션:**
- `borderLines`: 외곽선 정보
- `extrusionDepth`: 측면 높이 (기본값: 0.001)

**작동 원리:**
1. 외곽선의 각 선분마다 사각형 생성
2. 위쪽 정점: 폴리곤 높이
3. 아래쪽 정점: 구 표면까지 내림
4. 모든 사각형을 하나의 BufferGeometry로 병합

**사용처:**
- RegionFeature의 입체감 표현
- z-fighting 방지

## 좌표계 및 변환

### HyperGlobe 좌표계

**원점:** 지구 중심

**축 방향:**
- x축: 본초자오선(경도 0°) + 적도(위도 0°)
- y축: 북극 방향
- z축: 동경 90° 방향

### 변환 체인

```
GeoJSON (경위도)
    ↓ CoordinateConverter.convert()
3D 직교좌표
    ↓ BufferGeometry
GPU 메모리
    ↓ WebGL
화면
```

## 성능 최적화 기법

### 드로우콜 최소화
- `mergeGeometries`로 여러 지오메트리 병합
- 하나의 메시로 렌더링

### 메모이제이션
- React의 `useMemo`로 불필요한 재계산 방지
- 데이터가 변경될 때만 재생성

### TypedArray 사용
- Float32Array, Uint32Array 사용
- 일반 배열보다 메모리 효율적
- GPU 전송 최적화

### 정밀도 제한
- `roundCoordinate`로 불필요한 정밀도 제거
- 파일 크기 감소
- 비교 연산 최적화

## 수학 공식 참조

### 구면 → 직교 좌표 변환
```
x = R × cos(φ) × cos(λ)
y = R × sin(φ)
z = R × cos(φ) × sin(λ)
```

### 직교 → 구면 좌표 변환
```
R = √(x² + y² + z²)
φ = arcsin(y / R)
λ = arctan2(z, x)
```

### 벡터 크기
```
|v| = √(x² + y² + z²)
```

### 정규화
```
v̂ = v / |v|
```

## 관련 문서
- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RegionFeature 컴포넌트](./region-feature.md)
- [Graticule 컴포넌트](./graticule.md)
- [ColorScale 시스템](./colorscale.md)
