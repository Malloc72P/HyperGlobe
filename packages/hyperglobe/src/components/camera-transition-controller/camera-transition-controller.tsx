import { OrthographicProj } from '@hyperglobe/tools';
import type { Coordinate } from '@hyperglobe/interfaces';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { getEasingFunction } from '../../lib/easing';
import type { CameraTransitionOptions, PathPoint } from '../../types/camera';

/**
 * 트랜지션 내부 상태
 */
interface TransitionState {
  /** 트랜지션이 활성화되어 있는지 여부 */
  isActive: boolean;
  /** 전체 경로 */
  path: PathPoint[];
  /** 현재 진행 중인 구간 인덱스 */
  currentSegmentIndex: number;
  /** 각 구간별 보간된 포인트들 */
  segmentPointsCache: Map<number, Vector3[]>;
  /** 트랜지션 시작 시간 */
  startTime: number;
  /** 트랜지션 옵션 */
  options: Required<CameraTransitionOptions>;
  /** 마지막으로 onPathPointReached가 호출된 인덱스 */
  lastReachedIndex: number;
  /** 전체 애니메이션 길이 (캐시) */
  totalDuration: number;
  /** 이징 함수 (캐시) */
  easingFn: (t: number) => number;
}

const DEFAULT_OPTIONS: Required<CameraTransitionOptions> = {
  lockCamera: true,
  easing: 'linear',
  onProgress: () => {},
  onPathPointReached: () => {},
  onComplete: () => {},
};

const DEFAULT_DURATION = 1000;
const DEFAULT_DISTANCE = 5;
const SEGMENTS_PER_UNIT_DISTANCE = 20; // 거리 단위당 세그먼트 수

/**
 * 두 좌표 사이의 대략적인 거리를 계산합니다 (각도 기반)
 */
function estimateDistance(from: Vector3, to: Vector3): number {
  return from.angleTo(to);
}

/**
 * 거리에 따라 적절한 세그먼트 수를 계산합니다
 */
function calculateSegments(distance: number): number {
  return Math.min(100, Math.max(10, Math.floor(distance * SEGMENTS_PER_UNIT_DISTANCE)));
}

export interface CameraTransitionControllerProps {
  /** 카메라가 잠겨있는지 여부 */
  onLockChange: (locked: boolean) => void;
  /** followPath를 외부에 노출 */
  onFollowPathReady: (fn: (path: PathPoint[], options?: CameraTransitionOptions) => void) => void;
  /** cancelTransition을 외부에 노출 */
  onCancelTransitionReady: (fn: () => void) => void;
}

/**
 * Canvas 내부에서 카메라 트랜지션을 제어하는 컴포넌트
 *
 * Canvas 외부에서는 이 컴포넌트를 사용할 수 없으므로,
 * HyperGlobe 컴포넌트 내부(Canvas 안)에서 렌더링되어야 합니다.
 */
export function CameraTransitionController({
  onLockChange,
  onFollowPathReady,
  onCancelTransitionReady,
}: CameraTransitionControllerProps) {
  const { camera } = useThree();

  const stateRef = useRef<TransitionState>({
    isActive: false,
    path: [],
    currentSegmentIndex: 0,
    segmentPointsCache: new Map(),
    startTime: 0,
    options: DEFAULT_OPTIONS,
    lastReachedIndex: -1,
    totalDuration: 0,
    easingFn: (t) => t, // linear
  });

  /**
   * 경로를 따라 카메라를 이동시킵니다
   */
  const followPath = useCallback(
    (path: PathPoint[], options?: CameraTransitionOptions) => {
      if (path.length === 0) {
        console.warn('followPath: 경로가 비어있습니다.');
        return;
      }

      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      // 현재 카메라 위치를 시작점으로 설정
      const currentPosition = camera.position.clone().normalize();
      const currentDistance = camera.position.length();

      // 현재 위치에서 첫 번째 경로 지점까지의 경로를 생성
      const segmentPointsCache = new Map<number, Vector3[]>();

      // 각 구간의 경로 포인트 미리 계산
      let previousPoint = currentPosition;
      let previousDistance = currentDistance;

      for (let i = 0; i < path.length; i++) {
        const point = path[i];
        const targetDistance = point.distance ?? DEFAULT_DISTANCE;

        // Globe가 Y축으로 -90도 회전되어 있으므로, 카메라 좌표도 조정
        const adjustedCoordinate: Coordinate = [point.coordinate[0] - 90, point.coordinate[1]];

        // 목표 지점의 방향 벡터 (OrthographicProj를 사용하여 정확하게 변환)
        const projectedVector = OrthographicProj.project(adjustedCoordinate, 1);
        const targetDirection = new Vector3(...projectedVector).normalize();

        // 세그먼트 수 계산
        const distance = estimateDistance(previousPoint, targetDirection);
        const segments = calculateSegments(distance);

        // 대권항로 생성 (선형 보간으로 포인트 생성, 이징은 나중에 적용)
        const pathPoints: Vector3[] = [];

        for (let j = 0; j <= segments; j++) {
          const t = j / segments;

          // SLERP로 방향 보간 (선형)
          const direction = new Vector3().lerpVectors(previousPoint, targetDirection, t);
          direction.normalize();

          // 거리 보간 (선형)
          const interpolatedDistance = previousDistance + (targetDistance - previousDistance) * t;

          // 최종 위치
          const position = direction.multiplyScalar(interpolatedDistance);
          pathPoints.push(position);
        }

        segmentPointsCache.set(i, pathPoints);

        previousPoint = targetDirection;
        previousDistance = targetDistance;
      }

      // totalDuration 계산 (한 번만)
      let totalDuration = 0;
      for (const point of path) {
        totalDuration += point.duration ?? DEFAULT_DURATION;
      }

      // 이징 함수 캐시
      const easingFn = getEasingFunction(mergedOptions.easing);

      // 상태 초기화
      stateRef.current = {
        isActive: true,
        path,
        currentSegmentIndex: 0,
        segmentPointsCache,
        startTime: Date.now(),
        options: mergedOptions,
        lastReachedIndex: -1,
        totalDuration,
        easingFn,
      };

      onLockChange(mergedOptions.lockCamera);
    },
    [camera, onLockChange]
  );

  /**
   * 트랜지션을 취소합니다
   */
  const cancelTransition = useCallback(() => {
    if (stateRef.current.isActive) {
      stateRef.current.isActive = false;
      onLockChange(false);
    }
  }, [onLockChange]);

  // 함수를 외부에 노출
  useEffect(() => {
    onFollowPathReady(followPath);
    onCancelTransitionReady(cancelTransition);
  }, [followPath, cancelTransition, onFollowPathReady, onCancelTransitionReady]);

  /**
   * 매 프레임마다 카메라 위치를 업데이트합니다
   */
  useFrame(() => {
    const state = stateRef.current;

    if (!state.isActive) return;

    const elapsed = Date.now() - state.startTime;
    const totalDuration = state.totalDuration; // 캐시된 값 사용
    let accumulatedTime = 0;

    // 현재 구간 찾기
    for (let i = 0; i < state.path.length; i++) {
      const segmentDuration = state.path[i].duration ?? DEFAULT_DURATION;

      if (elapsed < accumulatedTime + segmentDuration) {
        // 현재 이 구간에 있음
        const segmentElapsed = elapsed - accumulatedTime;
        const rawProgress = segmentElapsed / segmentDuration;

        // 이징 적용 (캐시된 함수 사용)
        const easedProgress = state.easingFn(rawProgress);

        // 경로상의 위치 계산
        const segmentPoints = state.segmentPointsCache.get(i);
        if (!segmentPoints) break;

        const pointIndex = Math.floor(easedProgress * (segmentPoints.length - 1));
        const localProgress = (easedProgress * (segmentPoints.length - 1)) % 1;

        const currentPoint = segmentPoints[pointIndex];
        const nextPoint = segmentPoints[Math.min(pointIndex + 1, segmentPoints.length - 1)];

        // 보간 (카메라 position에 직접 lerp 적용하여 객체 생성 최소화)
        camera.position.lerpVectors(currentPoint, nextPoint, localProgress);
        // 카메라가 지구 중심(0,0,0)을 바라보도록 설정
        camera.lookAt(0, 0, 0);

        // 전체 진행률 콜백
        const overallProgress = ((accumulatedTime + segmentElapsed) / totalDuration) * 100;
        state.options.onProgress(overallProgress);

        // 현재 구간 업데이트
        state.currentSegmentIndex = i;

        // 지점 도착 콜백 (한 번만 호출)
        if (rawProgress >= 0.95 && state.lastReachedIndex !== i) {
          state.lastReachedIndex = i;
          state.options.onPathPointReached(i, state.path[i]);
        }

        return;
      }

      accumulatedTime += segmentDuration;
    }

    // 모든 경로를 완료했을 때
    if (elapsed >= totalDuration) {
      // 마지막 지점으로 이동
      const lastSegmentPoints = state.segmentPointsCache.get(state.path.length - 1);
      if (lastSegmentPoints && lastSegmentPoints.length > 0) {
        camera.position.copy(lastSegmentPoints[lastSegmentPoints.length - 1]);
        camera.lookAt(0, 0, 0);
      }

      state.options.onProgress(100);
      state.options.onComplete();
      state.isActive = false;
      onLockChange(false);
    }
  });

  return null;
}
