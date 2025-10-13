'use client';

import { AppShell } from '@mantine/core';
import { PropsWithChildren } from 'react';

export interface LandingLayoutProps extends PropsWithChildren {}

import { MainHeader } from './main-header';

export function MainLayout({ children }: LandingLayoutProps) {
  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <MainHeader />
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
