/**
 * 이징 함수 타입
 *
 * @param t - 0~1 사이의 정규화된 시간 값
 * @returns 0~1 사이의 변환된 값
 */
export type EasingFunction = (t: number) => number;

/**
 * Cubic Bezier 곡선을 계산하는 함수
 * CSS의 cubic-bezier() 함수를 구현
 *
 * @param t - 0~1 사이의 정규화된 시간 값
 * @param p1 - 첫 번째 제어점 (x1, y1)
 * @param p2 - 두 번째 제어점 (x2, y2)
 * @returns 0~1 사이의 변환된 값
 */
function cubicBezier(t: number, p1: [number, number], p2: [number, number]): number {
  const [x1, y1] = p1;
  const [x2, y2] = p2;

  // Newton-Raphson 방법으로 t에 해당하는 x 값을 찾음
  const epsilon = 1e-6;
  let guess = t;

  for (let i = 0; i < 8; i++) {
    const x = cubicBezierX(guess, x1, x2);
    const dx = x - t;

    if (Math.abs(dx) < epsilon) break;

    const derivative = cubicBezierDerivative(guess, x1, x2);
    if (Math.abs(derivative) < epsilon) break;

    guess -= dx / derivative;
  }

  return cubicBezierY(guess, y1, y2);
}

function cubicBezierX(t: number, x1: number, x2: number): number {
  // B(t) = 3(1-t)²t·x1 + 3(1-t)t²·x2 + t³
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;

  return 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t3;
}

function cubicBezierY(t: number, y1: number, y2: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;

  return 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t3;
}

function cubicBezierDerivative(t: number, x1: number, x2: number): number {
  // B'(t) = 3(1-t)²·x1 + 6(1-t)t·(x2-x1) + 3t²·(1-x2)
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return 3 * mt2 * x1 + 6 * mt * t * (x2 - x1) + 3 * t2 * (1 - x2);
}

/**
 * 이징 함수 모음
 *
 * CSS의 표준 cubic-bezier 값을 기반으로 구현된 애니메이션 이징 함수들입니다.
 */
export const easingFunctions: Record<string, EasingFunction> = {
  /**
   * 선형 이징 - 일정한 속도로 이동
   * CSS: cubic-bezier(0, 0, 1, 1)
   */
  linear: (t) => t,

  /**
   * ease-in - 천천히 시작해서 점점 빨라짐
   * CSS: cubic-bezier(0.42, 0, 1, 1)
   */
  'ease-in': (t) => cubicBezier(t, [0.42, 0], [1, 1]),

  /**
   * ease-out - 빠르게 시작해서 점점 느려짐
   * CSS: cubic-bezier(0, 0, 0.58, 1)
   */
  'ease-out': (t) => cubicBezier(t, [0, 0], [0.58, 1]),

  /**
   * ease-in-out - 천천히 시작하고 천천히 끝남
   * CSS: cubic-bezier(0.42, 0, 0.58, 1)
   */
  'ease-in-out': (t) => cubicBezier(t, [0.42, 0], [0.58, 1]),
};

/**
 * 이징 함수를 가져옵니다.
 *
 * @param type - 이징 함수 타입
 * @returns 해당하는 이징 함수
 */
export function getEasingFunction(
  type: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'linear'
): EasingFunction {
  return easingFunctions[type] || easingFunctions['linear'];
}
