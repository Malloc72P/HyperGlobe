# MarkerFeature 컴포넌트

## 개요

지구본 위에 주요 지점을 마커와 라벨로 표시하는 컴포넌트입니다.

**파일**: `packages/hyperglobe/src/components/marker-feature/`

**사용 예시**: Storybook의 `MarkerFeature` 스토리 참조

### 특징

- **용도**: 주요 도시, 랜드마크, 이벤트 위치
- **권장 개수**: 50개 이하
- **기능**: SVG 아이콘, 텍스트 라벨, CSS 스타일링
- **기술**: @react-three/drei의 Html 컴포넌트

## Props

**타입 정의**: `packages/hyperglobe/src/types/hyperglobe-props.ts` (`MarkerConfig`, `SvgStyle`)

> **상세 Props**: `packages/hyperglobe/src/types/hyperglobe-props.ts` 참조

## 구현 원리

### 1. 좌표 변환
`CoordinateConverter`로 경위도 → 3D 좌표 변환

### 2. 아이콘 타입
- `pin`, `circle`: 내장 SVG path
- `custom`: `iconPath` 사용
- `useMarkerShape` 훅으로 관리

### 3. Occlusion (가시성)
매 프레임 내적 계산으로 가시성 판단:
- 내적 > 0.1: 같은 반구 (보임)
- 내적 ≤ 0.1: 반대편 (숨김)

### 4. Billboard
항상 카메라를 향하도록 자동 회전

## 성능 고려사항

- **권장 개수**: 50개 이하
- **많은 마커**: PointsFeature 사용 고려
- **최적화**: 시점 밖 마커는 렌더링하지 않음

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RouteFeature](./route-feature.md)
