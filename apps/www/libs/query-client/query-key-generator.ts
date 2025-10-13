'use client';

import { useSession } from 'next-auth/react';

export const queryKeyGen = {
  datasets: (session: ReturnType<typeof useSession>) =>
    ['datasets', session.data?.user.id] as string[],
};
