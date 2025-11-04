import { useCallback, useRef } from 'react';

export interface UseThrottleProps<Args extends any[], ReturnType = any> {
  delay?: number;
  fn: (...args: Args) => ReturnType;
}

export function useThrottle<Args extends any[], ReturnType = any>({
  delay = 50,
  fn,
}: UseThrottleProps<Args, ReturnType>) {
  const throttleRef = useRef(false);

  const throttledCallback = useCallback(
    (...args: Args) => {
      if (throttleRef.current) return null;

      const returnValue = fn(...args);
      throttleRef.current = true;

      setTimeout(() => {
        throttleRef.current = false;
      }, delay);

      return returnValue;
    },
    [delay, fn]
  );

  return throttledCallback;
}
