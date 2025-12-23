import { isEqual } from 'lodash-es';
import { useRef } from 'react';

export function useCompare<T>(value: T): T | null {
  const ref = useRef<T | null>(null);

  // 이전 값과 현재 값이 다를 때만 ref 업데이트 (깊은 비교)
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}
