# Graticule 컴포넌트

## 개요

지구본에 경선(Longitude)과 위선(Latitude) 격자무늬를 추가하는 컴포넌트입니다.

**파일**: `packages/hyperglobe/src/components/graticule/`

**사용 예시**: Storybook의 `Graticule` 스토리 참조

### 주요 기능

- 경선/위선 격자 렌더링
- 간격 조절 (기본: 10도)
- 색상/두께 스타일링

## Props

**타입 정의**: `packages/hyperglobe/src/types/hyperglobe-props.ts` (`GraticuleConfig`)

> **상세 Props**: 타입 정의 파일 또는 Storybook 참조

## 구현 원리

### 격자선 생성

**위선 (Latitude)**
- `-90° ~ +90°` 범위를 `latitudeStep`으로 분할
- 각 위도에서 `y = sin(latitude)` 계산
- 해당 y 위치에 원형 선 생성

**경선 (Longitude)**
- `0° ~ 180°` 범위를 `longitudeStep`으로 분할
- 각 경도에서 y축 중심 회전
- 남극-북극 연결 반원 생성

### 좌표 변환

도(Degree) → 라디안(Radian): `degree * (π / 180)`

**구면 좌표계**
- 위도(Latitude): -90° ~ +90° (남극 ~ 북극)
- 경도(Longitude): -180° ~ +180° (본초자오선 기준)

### 최적화

**대칭성 활용**
- 위선: 북반구/남반구 동시 생성으로 반복 감소
- 경선: 180도만 생성하면 전체 구 표현 가능

**선 렌더링**
- `GraticuleLine` 컴포넌트 사용
- `@react-three/drei`의 `Line` 컴포넌트를 활용한 효율적인 렌더링

**극점 처리**
- 위도가 ±90도(극점)인 경우 격자선을 그리지 않음 (점으로 수렴하므로 불필요)

**Z-fighting 방지**
- 격자선 반지름에 미세한 오프셋(+0.0006)을 추가하여 지구본 표면과의 깜빡임 현상 방지

## 구현 상세

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

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [수학 라이브러리](./math-libraries.md)
