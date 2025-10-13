'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export function PageProgressBar() {
  return <ProgressBar height="4px" options={{ showSpinner: true }} shallowRouting />;
}
