/**
 * 이징 함수 타입
 *
 * @param t - 0~1 사이의 정규화된 시간 값
 * @returns 0~1 사이의 변환된 값
 */
export type EasingFunction = (t: number) => number;

/**
 * 이징 함수 모음
 *
 * 애니메이션의 진행 속도를 제어하는 함수들입니다.
 */
export const easingFunctions: Record<string, EasingFunction> = {
  /**
   * 선형 이징 - 일정한 속도로 이동
   */
  linear: (t) => t,

  /**
   * ease-in - 천천히 시작해서 점점 빨라짐
   */
  'ease-in': (t) => t * t,

  /**
   * ease-out - 빠르게 시작해서 점점 느려짐
   */
  'ease-out': (t) => t * (2 - t),

  /**
   * ease-in-out - 천천히 시작하고 천천히 끝남
   */
  'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

/**
 * 이징 함수를 가져옵니다.
 *
 * @param type - 이징 함수 타입
 * @returns 해당하는 이징 함수
 */
export function getEasingFunction(
  type: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'ease-in-out'
): EasingFunction {
  return easingFunctions[type] || easingFunctions['ease-in-out'];
}
