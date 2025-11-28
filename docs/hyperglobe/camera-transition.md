# 카메라 트랜지션 (Camera Transition)

## 개요

카메라 트랜지션은 지정된 경위도 좌표 경로를 따라 카메라를 자동으로 이동시키는 기능입니다. 대권항로(Great Circle)를 따라 부드럽게 이동하며, 애니메이션 진행 상황을 추적하고 제어할 수 있습니다.

## 사용 사례

- RoundTheWorld 데모처럼 경로를 따라 카메라 자동 회전
- RouteFeature가 점진적으로 그려지는 동안 카메라가 경로를 따라가도록 동기화
- 특정 지역들을 순차적으로 보여주는 투어 기능

## API 설계

### 기본 사용법

```tsx
import { useRef } from 'react';
import { HyperGlobe, HyperglobeRef } from 'hyperglobe';

function App() {
  const hyperglobeRef = useRef<HyperglobeRef>(null);

  const startTour = () => {
    hyperglobeRef.current?.followPath(
      [
        { coordinate: [127, 37], duration: 2000 },      // 서울
        { coordinate: [-122, 37], duration: 3000 },     // 샌프란시스코
        { coordinate: [-74, 40], duration: 2500 },      // 뉴욕
      ],
      {
        lockCamera: true,
        easing: 'ease-in-out',
        onComplete: () => console.log('투어 완료!')
      }
    );
  };

  return (
    <HyperGlobe ref={hyperglobeRef}>
      {/* 컴포넌트 */}
    </HyperGlobe>
  );
}
```

### 타입 정의

```ts
interface PathPoint {
  /**
   * 목표 지점의 경위도 좌표 [경도, 위도]
   */
  coordinate: Coordinate;
  
  /**
   * 이전 지점에서 이 지점까지 이동하는데 걸리는 시간 (밀리초)
   * 
   * @default 1000
   */
  duration?: number;
  
  /**
   * 카메라와 지구 중심 사이의 거리
   * 
   * @default 5 (HyperGlobe의 기본 카메라 거리)
   */
  distance?: number;
}

interface CameraTransitionOptions {
  /**
   * 카메라 이동 중 사용자 상호작용(드래그, 줌 등)을 차단할지 여부
   * 
   * - true: OrbitControls를 비활성화하여 카메라를 완전히 잠금
   * - false: 사용자가 언제든지 카메라를 제어할 수 있음 (트랜지션 자동 취소)
   * 
   * @default true
   */
  lockCamera?: boolean;
  
  /**
   * 이징 함수 타입
   * 
   * @default 'ease-in-out'
   */
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  
  /**
   * 애니메이션 진행률 변경 시 호출되는 콜백
   * 
   * @param progress - 0~100 사이의 진행률
   */
  onProgress?: (progress: number) => void;
  
  /**
   * 각 경로 지점에 도착했을 때 호출되는 콜백
   * 
   * @param index - 도착한 지점의 인덱스 (0부터 시작)
   * @param point - 도착한 지점의 정보
   */
  onPathPointReached?: (index: number, point: PathPoint) => void;
  
  /**
   * 전체 경로 이동이 완료되었을 때 호출되는 콜백
   */
  onComplete?: () => void;
}

interface HyperglobeRef {
  /**
   * 지정된 경로를 따라 카메라를 이동시킵니다.
   * 
   * - 현재 카메라 위치에서 시작하여 각 PathPoint를 순차적으로 방문합니다.
   * - 각 구간은 대권항로(Great Circle)를 따라 이동합니다.
   * - duration에 따라 부드럽게 보간됩니다.
   * 
   * @param path - 이동할 경로 지점 배열
   * @param options - 트랜지션 옵션
   */
  followPath(path: PathPoint[], options?: CameraTransitionOptions): void;
  
  /**
   * 진행 중인 카메라 트랜지션을 취소합니다.
   * 
   * - 카메라는 현재 위치에서 멈춥니다.
   * - lockCamera가 true였다면 OrbitControls가 다시 활성화됩니다.
   */
  cancelTransition(): void;
}
```

## 구현 계획

### 1. 타입 정의
**파일**: `packages/hyperglobe/src/types/camera.ts` (신규)

- `PathPoint` 인터페이스
- `CameraTransitionOptions` 인터페이스
- `HyperglobeRef` 인터페이스 (카메라 관련 메서드만 우선 정의)

### 2. 카메라 트랜지션 훅
**파일**: `packages/hyperglobe/src/hooks/use-camera-transition.ts` (신규)

#### 주요 기능:
- `followPath` 구현
  - 현재 카메라 위치를 시작점으로 사용
  - `createGreatCirclePath`를 사용하여 각 구간의 경로 생성
  - `useFrame`을 활용한 애니메이션 프레임 업데이트
  - 이징 함수 적용
  - 진행률, 지점 도착, 완료 이벤트 발생

- `cancelTransition` 구현
  - 애니메이션 상태 초기화
  - OrbitControls 복원

#### 의존성:
- `@hyperglobe/tools`의 `createGreatCirclePath`
- `@react-three/fiber`의 `useFrame`, `useThree`
- Three.js의 `Vector3`, `Camera`

#### 내부 상태:
```ts
interface TransitionState {
  isActive: boolean;
  path: PathPoint[];
  currentSegmentIndex: number;
  segmentProgress: number; // 0~1
  segmentPoints: Vector3[]; // 현재 구간의 보간 포인트들
  startTime: number;
  options: Required<CameraTransitionOptions>;
}
```

### 3. HyperGlobe 컴포넌트 수정
**파일**: `packages/hyperglobe/src/components/hyperglobe/hyperglobe.tsx`

#### 변경 사항:
1. `forwardRef`를 사용하여 ref 지원 추가
2. `HyperglobeRef` 타입 구현
3. 내부에서 `useCameraTransition` 훅 사용
4. OrbitControls에 `enabled` prop 바인딩
5. `useImperativeHandle`로 `followPath`, `cancelTransition` 메서드 노출

```tsx
export const HyperGlobe = forwardRef<HyperglobeRef, HyperGlobeProps>(
  function HyperGlobe(props, ref) {
    // ... 기존 코드 ...
    
    const {
      followPath,
      cancelTransition,
      isLocked
    } = useCameraTransition();
    
    useImperativeHandle(ref, () => ({
      followPath,
      cancelTransition,
    }));
    
    return (
      <Canvas>
        <OrbitControls
          enabled={!isLocked}
          // ... 기존 props ...
        />
        {/* ... */}
      </Canvas>
    );
  }
);
```

### 4. 유틸리티 함수
**파일**: `packages/hyperglobe/src/lib/easing.ts` (신규)

이징 함수 구현:
```ts
export type EasingFunction = (t: number) => number;

export const easingFunctions: Record<string, EasingFunction> = {
  linear: (t) => t,
  'ease-in': (t) => t * t,
  'ease-out': (t) => t * (2 - t),
  'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
};
```

### 5. 경로 보간 로직

각 프레임마다:
1. 현재 시간 기준으로 전체 진행률 계산
2. 현재 어느 구간에 있는지 판단
3. 구간 내 진행률 계산
4. 이징 함수 적용
5. `createGreatCirclePath`로 생성된 포인트들 사이에서 보간
6. 카메라 위치 업데이트
7. distance 값에 따라 카메라 거리 조정

```ts
// 의사 코드
const updateCamera = (deltaTime: number) => {
  // 1. 전체 경과 시간 계산
  const elapsed = Date.now() - state.startTime;
  
  // 2. 현재 구간 찾기
  let accumulatedTime = 0;
  for (let i = 0; i < state.path.length; i++) {
    const segmentDuration = state.path[i].duration || 1000;
    
    if (elapsed < accumulatedTime + segmentDuration) {
      // 현재 이 구간에 있음
      const segmentElapsed = elapsed - accumulatedTime;
      const rawProgress = segmentElapsed / segmentDuration;
      
      // 3. 이징 적용
      const easedProgress = easing(rawProgress);
      
      // 4. 경로상의 위치 계산
      const pointIndex = Math.floor(easedProgress * (segmentPoints.length - 1));
      const localProgress = (easedProgress * (segmentPoints.length - 1)) % 1;
      
      // 5. 보간
      const currentPoint = segmentPoints[pointIndex];
      const nextPoint = segmentPoints[pointIndex + 1];
      const interpolated = currentPoint.lerp(nextPoint, localProgress);
      
      // 6. 카메라 업데이트
      camera.position.copy(interpolated);
      
      // 7. distance 적용
      const targetDistance = state.path[i].distance || 5;
      camera.position.normalize().multiplyScalar(targetDistance);
      
      break;
    }
    
    accumulatedTime += segmentDuration;
  }
};
```

## 테스트 계획

### 단위 테스트
**파일**: `packages/hyperglobe/src/hooks/use-camera-transition.test.ts`

- 경로 포인트 보간 정확성
- 이징 함수 적용 확인
- 진행률 계산 검증
- 콜백 호출 타이밍 검증

### 통합 테스트 (Storybook)
**파일**: `packages/hyperglobe/pages/camera-transition/camera-transition.stories.tsx`

#### 스토리 목록:
1. **BasicTransition**: 간단한 3개 지점 이동
2. **WithDistanceChange**: 거리 변화를 포함한 이동
3. **UnlockedCamera**: 사용자 상호작용 허용 모드
4. **WithCallbacks**: 모든 콜백 동작 확인
5. **LongPath**: 10개 이상의 지점을 가진 긴 경로
6. **RoundTheWorldIntegration**: RoundTheWorld 데모와 통합

### E2E 테스트
**파일**: `apps/e2e/src/camera-transition/*.spec.ts`

- 경로 이동 완료 확인
- 취소 기능 동작 확인
- lockCamera 옵션 동작 확인

## 구현 순서

1. ✅ 타입 정의 작성
2. ✅ 이징 함수 유틸리티 구현
3. ✅ `useCameraTransition` 훅 구현
4. ✅ `HyperGlobe` 컴포넌트에 ref 지원 추가
5. ✅ Storybook 스토리 작성 및 수동 테스트
6. ✅ 단위 테스트 작성
7. ✅ E2E 테스트 작성
8. ✅ 문서화 업데이트 (README, API 문서)

## 주의사항

### OrbitControls와의 충돌
- `lockCamera: true`일 때 OrbitControls의 `enabled`를 `false`로 설정
- 트랜지션 완료 또는 취소 시 다시 활성화

### 성능 고려

#### 최적화된 부분
1. **totalDuration 캐싱**: 매 프레임 재계산 대신 초기화 시 한 번만 계산
2. **이징 함수 캐싱**: 함수 조회를 초기화 시 한 번만 수행
3. **Vector3 객체 재사용**: `camera.position.lerpVectors()` 직접 호출로 새 객체 생성 최소화
4. **경로 포인트 미리 계산**: 모든 세그먼트 포인트를 초기화 시 생성하여 캐시
5. **onProgress 쓰로틀링**: 100ms 간격으로 제한하여 React 상태 업데이트 빈도 감소

#### segments 수 동적 조정
```ts
// 거리에 비례하여 세그먼트 수 결정 (최소 10, 최대 100)
const calculateSegments = (distance: number): number => {
  return Math.min(100, Math.max(10, Math.floor(distance * 20)));
};
```

짧은 거리는 적은 세그먼트를, 긴 거리는 많은 세그먼트를 사용하여 성능과 품질의 균형을 맞춥니다.
- segments 수는 경로 길이에 따라 동적 조정 (짧은 거리는 적은 segments)

### 경로 최적화
```ts
// 세그먼트 수 계산 예시
const calculateSegments = (from: Coordinate, to: Coordinate): number => {
  const distance = getGreatCircleDistance(from, to);
  // 거리에 비례하여 세그먼트 수 결정 (최소 10, 최대 100)
  return Math.min(100, Math.max(10, Math.floor(distance / 10)));
};
```

## 향후 확장 가능성

1. **카메라 회전**: 카메라가 바라보는 방향도 제어
2. **곡선 경로**: 베지어 곡선 등 다양한 경로 타입 지원
3. **루프 애니메이션**: 경로를 반복해서 재생
4. **일시정지/재개**: 트랜지션 일시정지 기능
5. **속도 제어**: 실시간으로 애니메이션 속도 조절

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RouteFeature 컴포넌트](./route-feature.md)
- [수학 라이브러리](./math-libraries.md) - `createGreatCirclePath` 활용
