# 카메라 트랜지션 (Camera Transition)

## 개요

지정된 경위도 좌표 경로를 따라 카메라를 자동으로 이동시키는 기능입니다. 대권항로(Great Circle)를 따라 부드럽게 이동하며, 애니메이션 진행 상황을 추적하고 제어할 수 있습니다.

**사용 예시**: Storybook의 `CameraTransition` 스토리 참조

## API

### 타입 정의

**파일**: `packages/hyperglobe/src/types/camera.ts`

- `PathPoint`: 카메라 경로의 단일 지점 (좌표, 지속시간, 거리)
- `CameraTransitionOptions`: 트랜지션 옵션 (잠금, 이징, 콜백)
- `HyperglobeRef`: HyperGlobe ref 타입 (`followPath`, `cancelTransition` 메서드)

## 구현 아키텍처

### 주요 컴포넌트

#### CameraTransitionController
**파일**: `packages/hyperglobe/src/components/camera-transition-controller/camera-transition-controller.tsx`

Canvas 내부에서 카메라 트랜지션을 제어하는 컴포넌트입니다.

**주요 기능:**
- `followPath`: 경로를 따라 카메라 이동
- `cancelTransition`: 진행 중인 트랜지션 취소
- SLERP 기반 대권항로 경로 생성
- 이징 함수 적용
- 각도 기반 동적 세그먼트 수 조정

**Props 타입**: `CameraTransitionControllerProps`, `CameraTransitionControllerRef`

#### HyperGlobe 통합
**파일**: `packages/hyperglobe/src/components/hyperglobe/hyperglobe.tsx`

- `forwardRef`로 `HyperglobeRef` 노출
- `CameraTransitionController`를 Canvas 내부에 배치
- OrbitControls 잠금/해제 관리
- 카메라 위치 변경 시 조명 동기화

### 유틸리티

#### 이징 함수
**파일**: `packages/hyperglobe/src/lib/easing.ts`

`linear`, `ease-in`, `ease-out`, `ease-in-out` 이징 함수 제공

## 구현 원리

### 경로 생성 및 보간

1. **초기화 단계** (한 번만 실행)
   - `createGreatCirclePath`로 SLERP 기반 대권항로 포인트 생성
   - 각도(`Vector3.angleTo`)에 비례한 세그먼트 수 결정 (최소 10, 최대 200)
   - 모든 구간의 포인트를 `segmentPointsCache`에 캐시
   - 거리 보간: 각 포인트에 시작 거리와 목표 거리 사이의 보간 값 적용

2. **애니메이션 단계** (매 프레임)
   - 경과 시간으로 현재 구간 판단
   - 이징 함수 적용 (캐시된 함수 사용)
   - 사전 계산된 SLERP 포인트들 사이를 선형 보간 (`lerpVectors`)
   - 카메라 위치 업데이트 및 지구 중심(0,0,0) 바라보기

### 성능 최적화

- **totalDuration 캐싱**: 초기화 시 한 번만 계산
- **이징 함수 캐싱**: 함수 조회를 초기화 시 수행
- **Vector3 객체 재사용**: `camera.position.lerpVectors()` 직접 호출
- **경로 포인트 사전 계산**: SLERP 포인트를 초기화 시 생성하여 캐시
- **동적 세그먼트 조정**: 거리에 따라 적절한 세그먼트 수 사용

> **핵심**: SLERP는 초기화 시 한 번만, 런타임에는 선형 보간만 수행하여 성능과 품질 균형 확보

## 테스트

### Storybook
**파일**: `packages/hyperglobe/pages/camera-transition/camera-transition.stories.tsx`

- 기본 카메라 트랜지션 데모
- 다양한 이징 함수 비교
- 경로 취소 기능 시연

### E2E 테스트
**파일**: `apps/e2e/src/camera-transition/*.spec.ts`

- [ ] 경로 이동 완료 확인
- [ ] 취소 기능 동작 확인  
- [ ] lockCamera 옵션 동작 확인

## 주의사항

### OrbitControls 충돌
`lockCamera: true` 시 OrbitControls를 비활성화하며, 트랜지션 완료/취소 시 자동 재활성화됩니다.

### 좌표 시스템
Globe가 Y축으로 -90도 회전되어 있으므로, 내부적으로 좌표를 조정합니다 (`coordinate[0] - 90`).

## 향후 확장

- 카메라 방향(lookAt) 제어
- 베지어 곡선 경로 지원
- 루프/일시정지/속도 제어

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RouteFeature 컴포넌트](./route-feature.md)
- [수학 라이브러리](./math-libraries.md) - `CoordinateConverter`, `createGreatCirclePath`
