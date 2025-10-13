import { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export type NavigateFn = (param: {
  href: string;
  method?: 'push' | 'replace' | 'back';
  options?: NavigateOptions;
}) => void;

export type PushFn = (href: string, options?: NavigateOptions) => void;

export type TransitionCallback = (
  next: () => void,
  from?: string,
  to?: string
) => Promise<void | (() => void)> | (void | (() => void));
