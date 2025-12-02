import { createGreatCirclePath, OrthographicProj } from '@hyperglobe/tools';
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
  onPathPointReached: () => {},
  onComplete: () => {},
};

const DEFAULT_DURATION = 1000;
const DEFAULT_DISTANCE = 5;
const SEGMENTS_PER_UNIT_DISTANCE = 20; // 거리 단위당 세그먼트 수

/**
 * 거리에 따라 적절한 세그먼트 수를 계산합니다
 */
function calculateSegments(distance: number): number {
  return Math.min(200, Math.max(10, Math.floor(distance * SEGMENTS_PER_UNIT_DISTANCE)));
}

export interface CameraTransitionControllerProps {
  /** 카메라가 잠겨있는지 여부 */
  onLockChange: (locked: boolean) => void;
  /** followPath를 외부에 노출 */
  onFollowPathReady: (fn: (path: PathPoint[], options?: CameraTransitionOptions) => void) => void;
  /** cancelTransition을 외부에 노출 */
  onCancelTransitionReady: (fn: () => void) => void;
  /** 카메라 위치가 변경될 때 호출되는 콜백 */
  onCameraPositionChange?: (position: Vector3) => void;
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
  onCameraPositionChange,
}: CameraTransitionControllerProps) {
  const { camera } = useThree();

  const stateRef = useRef<TransitionState>({
    isActive: false,
    path: [],
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

        // 현재 카메라 방향을 경위도 좌표로 변환 (역투영)
        // previousPoint는 이미 정규화된 방향 벡터
        const fromCoordinate = OrthographicProj.unproject([
          previousPoint.x,
          previousPoint.y,
          previousPoint.z,
        ]);

        // 목표 지점의 방향 벡터 (세그먼트 수 계산을 위해)
        const targetDirection = new Vector3(
          ...OrthographicProj.project(adjustedCoordinate, 1)
        ).normalize();

        // 이전 지점과 목표 지점 사이의 각도 계산, 이 각도로 세그먼트 수 결정
        const angularDistance = previousPoint.angleTo(targetDirection);
        const segments = calculateSegments(angularDistance);

        // SLERP를 사용한 대권항로 방향 벡터 생성
        const directions = createGreatCirclePath(fromCoordinate, adjustedCoordinate, segments);

        // 각 방향 벡터에 보간된 거리를 곱하여 최종 위치 계산
        const pathPoints: Vector3[] = directions.map((direction, j) => {
          const t = j / segments;
          const interpolatedDistance = previousDistance + (targetDistance - previousDistance) * t;
          return direction.clone().multiplyScalar(interpolatedDistance);
        });

        segmentPointsCache.set(i, pathPoints);

        // 다음 구간을 위해 현재 끝점을 저장
        previousPoint = directions[directions.length - 1].clone();
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
    // 전체 지속 시간
    const totalDuration = state.totalDuration;
    // 현재 구간 이전까지의 모든 duration의 합
    let accumulatedTime = 0;

    // 현재 구간 찾기.
    for (let i = 0; i < state.path.length; i++) {
      // 각 구간의 지속 시간.
      const segmentDuration = state.path[i].duration ?? DEFAULT_DURATION;

      // 현재 경과시간 elapsed가 구간이 끝나는 시점(accumulatedTime + segmentDuration)보다 작으면, 그 구간에 있는 것
      if (elapsed < accumulatedTime + segmentDuration) {
        // 현재 경과시간에서 이전 구간들 시간을 빼서 현재 구간에서의 경과시간 계산
        const segmentElapsed = elapsed - accumulatedTime;
        // 이 구간에서의 진행률 (0~1)
        const rawProgress = segmentElapsed / segmentDuration;

        // 이징 적용 (캐시된 함수 사용)
        const easedProgress = state.easingFn(rawProgress);

        // 경로상의 위치 계산
        const segmentPoints = state.segmentPointsCache.get(i);
        if (!segmentPoints) break;

        // 진행률을 통해 구면선형보간된 좌표배열에서 현재 위치를 구한다.
        const pointIndex = Math.floor(easedProgress * (segmentPoints.length - 1));

        // 현재 위치와 다음 위치를 구하고, 그 사이를 보간하기 위해 localProgress 계산
        const currentPoint = segmentPoints[pointIndex];
        const nextPoint = segmentPoints[Math.min(pointIndex + 1, segmentPoints.length - 1)];

        // 지역 진행률을 구하기 위해, 위치 진행률의 소수점 부분을 사용. pointIndex는 정수부분만 취했음에 주의.
        const localProgress = (easedProgress * (segmentPoints.length - 1)) % 1;

        // 보간 (카메라 position에 직접 lerp 적용하여 객체 생성 최소화)
        camera.position.lerpVectors(currentPoint, nextPoint, localProgress);

        // 카메라가 지구 중심(0,0,0)을 바라보도록 설정
        camera.lookAt(0, 0, 0);

        // 카메라 위치 변경 콜백 호출
        onCameraPositionChange?.(camera.position);

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
        // 마지막 위치 콜백 호출
        onCameraPositionChange?.(camera.position);
      }

      state.options.onComplete();
      state.isActive = false;
      onLockChange(false);
    }
  });

  return null;
}
