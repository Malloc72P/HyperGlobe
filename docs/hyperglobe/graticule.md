# Graticule 컴포넌트

## 개요

`Graticule`은 지구본에 경선(Longitude)과 위선(Latitude)으로 이루어진 격자무늬를 추가하는 컴포넌트입니다. 지리적 참조점을 시각적으로 제공합니다.

## 주요 기능

### 격자선 생성
- **경선**: 남북을 연결하는 세로선
- **위선**: 동서를 연결하는 가로선
- 간격 조절 가능 (기본: 경선 10도, 위선 10도)

### 스타일링
- 선 색상 설정
- 선 두께 조절

## Props

- `longitudeStep`: 경선 간격 (단위: 도, 기본값: 10)
- `latitudeStep`: 위선 간격 (단위: 도, 기본값: 10)
- `lineColor`: 격자선 색상 (기본값: '#808080')
- `lineWidth`: 격자선 두께 (기본값: 1.2)

## 사용 예시

### 기본 사용
```tsx
import { HyperGlobe, Graticule } from 'hyperglobe';

function Map() {
  return (
    <HyperGlobe>
      <Graticule />
    </HyperGlobe>
  );
}
```

### 간격 조절
```tsx
// 30도 간격의 격자선
<Graticule 
  longitudeStep={30}
  latitudeStep={30}
/>
```

### 스타일 커스터마이징
```tsx
<Graticule
  longitudeStep={15}
  latitudeStep={15}
  lineColor="#4a5568"
  lineWidth={2}
/>
```

## 기술 세부사항

### 렌더링 원리

#### 위선 생성
1. `-90도 ~ +90도` 범위를 `latitudeStep` 간격으로 분할
2. 각 위도에서 y 좌표 계산: `y = sin(latitude)`
3. 해당 y 위치에서 원형 선 생성 (x-z 평면에서 회전)
4. 대칭성 이용: 북반구와 남반구 동시 생성

```typescript
// 위도 30도일 때
const y = Math.sin(toRadian(30));  // 0.5
// y=0.5 위치에 원형 선 생성
```

#### 경선 생성
1. `0도 ~ 180도` 범위를 `longitudeStep` 간격으로 분할
2. 각 경도에서 y축 중심으로 회전
3. 남극에서 북극까지 연결되는 반원 생성

```typescript
// 경도 90도일 때
<GraticuleLine rotateY={toRadian(90)} />
```

### 좌표 변환

**도(Degree) → 라디안(Radian)**
```typescript
const radian = toRadian(degree);
// toRadian 함수: degree * (Math.PI / 180)
```

**구면 좌표계**
- 위도(Latitude): -90° ~ +90° (남극 ~ 북극)
- 경도(Longitude): -180° ~ +180° (본초자오선 기준)

### 최적화

**대칭성 활용**
- 위선: 북반구/남반구 동시 생성으로 반복 감소
- 경선: 180도만 생성하면 전체 구 표현 가능

**선 렌더링**
- `GraticuleLine` 컴포넌트 사용
- Three.js Line을 활용한 효율적인 렌더링

## 구현 상세

### GraticuleLine 컴포넌트
내부적으로 사용되는 개별 격자선 컴포넌트입니다.

**Props:**
- `y`: y 좌표 (위선용)
- `rotateX`: x축 회전 (위선용)
- `rotateY`: y축 회전 (경선용)
- `color`: 선 색상
- `lineWidth`: 선 두께

### 좌표계
HyperGlobe는 다음 좌표계를 사용합니다:
- **원점**: 지구 중심
- **x축**: 본초자오선(경도 0°), 적도(위도 0°) 교차점
- **y축**: 북극 방향
- **z축**: 동경 90° 방향

## 사용된 수학 라이브러리

#### @hyperglobe/tools
- `toRadian(degree)`: 도를 라디안으로 변환
  ```typescript
  toRadian(90) // π/2 ≈ 1.5708
  ```

#### 삼각함수
- `Math.sin()`: 위선의 y 좌표 계산
- 회전 행렬: Three.js가 내부적으로 처리

자세한 내용은 [수학 라이브러리 문서](./math-libraries.md)를 참조하세요.

## 시각적 효과

격자무늬는 다음과 같은 용도로 활용됩니다:
- 지리적 위치 파악
- 회전/줌 시 참조점 제공
- 구형 표면 인지 강화
- 전문적인 지도 느낌 제공

## 관련 문서
- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [수학 라이브러리](./math-libraries.md)
