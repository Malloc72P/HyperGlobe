export interface ThrottleParam {
  /**
   * 실행할 함수
   */
  fn: (...args: any[]) => void;
  /**
   * 지연 시간 (밀리초 단위)
   */
  delay?: number;
}

export function throttle({ fn, delay = 100 }: ThrottleParam) {
  // 쓰로틀
  // 이전에 호출된 시점으로부터 일정 시간 안에 다시 호출되면 스킵
  // 예를 들어, 100ms로 설정하면 100ms 이내에 다시 호출되면 무시됨
  // 일정시간이 지나서 호출되면 허용.
  let timestamp = -1;

  return () => {
    const currentTime = Date.now();

    // 이전 호출로부터 지난 시간이 delay 미만이면 스킵
    if (currentTime - timestamp < delay) return;

    timestamp = currentTime;
    fn();
  };
}
