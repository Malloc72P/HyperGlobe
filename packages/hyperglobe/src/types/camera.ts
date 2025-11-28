import { Coordinate } from '@hyperglobe/interfaces';

/**
 * 카메라 경로의 단일 지점
 */
export interface PathPoint {
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

/**
 * 카메라 트랜지션 옵션
 */
export interface CameraTransitionOptions {
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

/**
 * HyperGlobe 컴포넌트의 ref 타입
 */
export interface HyperglobeRef {
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
