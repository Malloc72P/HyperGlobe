'use client';

import { useNavbarStore } from '@libs/store/navbar-store/navbar-provider';
import { NavbarProps } from '@libs/store/navbar-store';
import { AppShell, Box } from '@mantine/core';
import { PropsWithChildren } from 'react';

export interface LandingLayoutProps extends PropsWithChildren {}

import { createContext } from 'react';
import { LandingHeader } from './landing-header';
import { LandingFooter } from './landing-footer';

export const navbarContext = createContext<NavbarProps | null>(null);

export function LandingLayout({ children }: LandingLayoutProps) {
  const opened = useNavbarStore((s) => s.opened);
  const toggle = useNavbarStore((s) => s.toggle);

  return (
    <AppShell header={{ height: 60 }}>
      <AppShell.Header>
        <LandingHeader />
      </AppShell.Header>

      <AppShell.Main>{children}</AppShell.Main>

      <AppShell.Section>
        <LandingFooter />
      </AppShell.Section>
    </AppShell>
  );
}
