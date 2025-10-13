import { LandingLayout } from '@components/landing-layout';
import { MainLayout } from '@components/main-layout';
import { PropsWithChildren } from 'react';

export default async function Layout({ children }: PropsWithChildren) {
  return <LandingLayout>{children}</LandingLayout>;
}
