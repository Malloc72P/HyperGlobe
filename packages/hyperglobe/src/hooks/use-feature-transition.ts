import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { getEasingFunction } from '../lib/easing';
import type { FeatureTransitionConfig, TransitionEasing } from '../types/transition';

export interface UseFeatureTransitionOptions {
  /**
   * 트랜지션 설정
   */
  transition?: FeatureTransitionConfig;

  /**
   * 트랜지션을 트리거할 의존성
   *
   * - 이 배열의 값이 변경될 때마다 트랜지션이 재시작됩니다.
   * - 예: 피처 배열, 데이터 객체 등
   */
  deps: unknown[];

  /**
   * 목표 투명도
   * @default 1
   */
  targetOpacity?: number;
}

export interface UseFeatureTransitionResult {
  /**
   * 현재 opacity 값 (0~1)
   */
  opacity: number;

  /**
   * 트랜지션 진행 중 여부
   */
  isTransitioning: boolean;
}

const DEFAULT_DURATION = 500;
const DEFAULT_EASING: TransitionEasing = 'linear' as const;

/**
 * 피처의 페이드 인 트랜지션을 관리하는 범용 훅
 *
 * deps가 변경될 때마다 opacity를 0에서 targetOpacity까지 애니메이션합니다.
 *
 * @example
 * ```tsx
 * // Region 피처에 적용
 * const { opacity } = useFeatureTransition({
 *   deps: [features],
 *   transition: { duration: 500, easing: 'ease-out' },
 *   targetOpacity: 0.8,
 * });
 *
 * <meshBasicMaterial opacity={opacity} transparent />
 * ```
 *
 * @example
 * ```tsx
 * // Marker 피처에 적용
 * const { opacity } = useFeatureTransition({
 *   deps: [markers],
 *   transition: { duration: 300, easing: 'ease-in-out' },
 * });
 * ```
 */
export function useFeatureTransition({
  transition,
  deps,
  targetOpacity = 1,
}: UseFeatureTransitionOptions): UseFeatureTransitionResult {
  const enabled = transition?.enabled ?? true;
  const duration = transition?.duration ?? DEFAULT_DURATION;
  const easing = transition?.easing ?? DEFAULT_EASING;

  const [opacity, setOpacity] = useState(enabled ? 0 : targetOpacity);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 트랜지션 상태를 ref로 관리 (useFrame에서 사용)
  const transitionRef = useRef({
    startTime: 0,
    isActive: false,
    easingFn: getEasingFunction(easing),
    targetOpacity,
  });

  // deps 변경 시 트랜지션 시작
  useEffect(() => {
    if (!enabled) {
      setOpacity(targetOpacity);
      return;
    }

    // deps가 비어있거나 모든 값이 falsy면 트랜지션 시작 안 함
    const hasValidDeps =
      deps.length > 0 &&
      deps.some((dep) => {
        if (Array.isArray(dep)) return dep.length > 0;
        if (dep && typeof dep === 'object') return Object.keys(dep).length > 0;
        return !!dep;
      });

    if (!hasValidDeps) {
      setOpacity(targetOpacity);
      return;
    }

    // 트랜지션 시작
    transitionRef.current = {
      startTime: performance.now(),
      isActive: true,
      easingFn: getEasingFunction(easing),
      targetOpacity,
    };
    setOpacity(0);
    setIsTransitioning(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, easing, targetOpacity]);

  // 매 프레임 opacity 업데이트
  useFrame(() => {
    const state = transitionRef.current;
    if (!state.isActive) return;

    const elapsed = performance.now() - state.startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = state.easingFn(progress);
    const newOpacity = easedProgress * state.targetOpacity;

    setOpacity(newOpacity);

    // 트랜지션 완료
    if (progress >= 1) {
      state.isActive = false;
      setIsTransitioning(false);
    }
  });

  return { opacity, isTransitioning };
}
