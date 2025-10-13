'use client';

import { PropsWithChildren, useState } from 'react';
import { TransitionRouter } from './transition-router-context';
import { Box } from '@mantine/core';

export function CsrTransitionRouter({ children }: PropsWithChildren) {
  const [visibility, setVisibility] = useState(false);
  return (
    <TransitionRouter
      beforeEntering={(next) => {
        setVisibility(true);
        next();
      }}
    >
      <Box
        pos="fixed"
        left={100}
        top={100}
        hidden={visibility}
        w={50}
        h={50}
        style={{ zIndex: 9999 }}
      ></Box>
      {children}
    </TransitionRouter>
  );
}
