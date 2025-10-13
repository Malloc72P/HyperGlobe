'use client';

import { PropsWithChildren } from 'react';
import { queryClient } from './query-client';
import { QueryClientProvider } from '@tanstack/react-query';

export interface QueryClientProviderProps extends PropsWithChildren {}

export function ReactQueryProvider({ children }: QueryClientProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
