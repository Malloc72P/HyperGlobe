'use client';

import { createContext, PropsWithChildren, use, useEffect, useMemo, useState } from 'react';
import { NavigateFn, TransitionCallback } from './transition-router';
import { usePathname, useRouter } from 'next/navigation';

export type TransitionRouterStatus = 'leaving' | 'entering' | 'none';

export interface ITransitionRouterContext {
  stage: TransitionRouterStatus;
  navigate: NavigateFn;
}

export const TransitionRouterContext = createContext<ITransitionRouterContext>({
  stage: 'none',
  navigate: () => {},
});

export interface TransitionRouterProps extends PropsWithChildren {
  beforeLeaving?: TransitionCallback;
  beforeEntering?: TransitionCallback;
}

export function TransitionRouter({
  beforeEntering,
  beforeLeaving,
  children,
}: TransitionRouterProps) {
  //-------------------------------------------------------------------------
  // useStates
  //-------------------------------------------------------------------------
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  /**
   * 페이지 진입, 이탈에 대한 상태를 표현하는 라우터 트랜지션 상태.
   */
  const [stage, setStage] = useState<TransitionRouterStatus>('none');

  const navigate: NavigateFn = async ({ href, method = 'push', options }) => {
    setStage('leaving');

    /**
     * 실제 페이지 이동을 수행하는 함수
     */
    let callback = () => {
      router[method](href, options);
    };

    if (method === 'back') {
      callback = () => router.back();
    }

    beforeLeaving && (await beforeLeaving(callback, pathname, href));
  };

  //-------------------------------------------------------------------------
  // useEffects
  //-------------------------------------------------------------------------
  useEffect(() => {
    if (stage === 'leaving') {
      setStage('entering');
    }
  }, [stage, isTransitioning]);

  useEffect(() => {
    if (stage === 'entering') {
      beforeEntering && beforeEntering(() => setStage('none'));
    }
  }, [stage, isTransitioning]);

  useEffect(() => {
    if (isTransitioning) {
      setIsTransitioning(false);
    }
  }, [isTransitioning]);

  //-------------------------------------------------------------------------
  // returns
  //-------------------------------------------------------------------------
  /**
   * Context 정보에 맞게 status 수집 후 객체로 구조화.
   */
  const value = useMemo<ITransitionRouterContext>(
    () => ({
      stage,
      navigate,
    }),
    [stage]
  );

  return (
    <TransitionRouterContext.Provider value={value}>{children}</TransitionRouterContext.Provider>
  );
}

export function useTransitionState() {
  return use(TransitionRouterContext);
}
