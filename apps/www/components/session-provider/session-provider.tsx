'use client';

import { PropsWithChildren } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

export function SessionProviderWrapper({
  children,
  session,
}: PropsWithChildren & { session: Session | null }) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
