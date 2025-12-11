import type { HGMFeature } from '@hyperglobe/interfaces';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { getEasingFunction } from '../../lib/easing';

/**
 * 트랜지션 이징 타입
 */
export type TransitionEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

/**
 * Region 트랜지션 설정
 */
export interface RegionTransitionConfig {
  /**
   * 트랜지션 활성화 여부
   * @default true
   */
  enabled?: boolean;

  /**
   * 트랜지션 지속 시간 (ms)
   * @default 500
   */
  duration?: number;

  /**
   * 이징 함수 타입
   * @default 'ease-out'
   */
  easing?: TransitionEasing;
}

export interface UseRegionTransitionOptions {
  /**
   * 트랜지션 설정
   */
  transition?: RegionTransitionConfig;

  /**
   * 피처 배열 (변경 시 트랜지션 재시작)
   */
  features: HGMFeature[];

  /**
   * 목표 투명도
   * @default 1
   */
  targetOpacity?: number;
}

export interface UseRegionTransitionResult {
  /**
   * 현재 opacity 값 (0~1)
   */
  opacity: number;

  /**
   * 트랜지션 진행 중 여부
   */
  isTransitioning: boolean;
}

const DEFAULT_DURATION = 200;
const DEFAULT_EASING: TransitionEasing = 'ease-in';

/**
 * Region 피처의 페이드 인 트랜지션을 관리하는 훅
 *
 * features가 변경될 때마다 opacity를 0에서 targetOpacity까지 애니메이션합니다.
 *
 * @example
 * ```tsx
 * const { opacity, isTransitioning } = useRegionTransition({
 *   features,
 *   transition: { duration: 500, easing: 'ease-out' },
 *   targetOpacity: 0.8,
 * });
 *
 * <meshBasicMaterial opacity={opacity} transparent />
 * ```
 */
export function useRegionTransition({
  transition,
  features,
  targetOpacity = 1,
}: UseRegionTransitionOptions): UseRegionTransitionResult {
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

  // features 변경 시 트랜지션 시작
  useEffect(() => {
    if (!enabled || features.length === 0) {
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
  }, [features, enabled, easing, targetOpacity]);

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
