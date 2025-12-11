/**
 * 트랜지션 이징 타입
 */
export type TransitionEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

/**
 * 피처 트랜지션 설정
 *
 * - 피처가 화면에 나타날 때 페이드 인 효과를 적용합니다.
 */
export interface FeatureTransitionConfig {
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
