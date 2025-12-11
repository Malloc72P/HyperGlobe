import { useEffect, useState, useRef, type RefObject } from 'react';

export interface UseIntersectionObserverOptions {
  /**
   * 요소가 얼마나 보일 때 감지할지 설정 (0.0 ~ 1.0)
   *
   * @default 0.1
   */
  threshold?: number;
  /**
   * 루트 요소의 마진 (CSS margin 값)
   *
   * @default '0px'
   */
  rootMargin?: string;
  /**
   * 한 번만 감지할지 여부
   * true이면 한 번 보인 후에는 더 이상 감지하지 않음
   *
   * @default true
   */
  triggerOnce?: boolean;
}

/**
 * Intersection Observer API를 사용하여 요소가 뷰포트에 들어왔는지 감지하는 훅
 *
 * @param options - Intersection Observer 옵션
 * @returns [ref, isIntersecting] - ref를 감지할 요소에 연결하고, isIntersecting으로 가시성 확인
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 이미 감지되었고 triggerOnce가 true면 더 이상 관찰하지 않음
    if (isIntersecting && triggerOnce) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);

        // triggerOnce가 true이고 요소가 보이면 관찰 중단
        if (entry.isIntersecting && triggerOnce && observerRef.current) {
          observerRef.current.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;
    observer.observe(element);

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [threshold, rootMargin, triggerOnce, isIntersecting]);

  return [elementRef, isIntersecting];
}
