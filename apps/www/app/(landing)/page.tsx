'use client';

import { useSession } from 'next-auth/react';
import { HeroWithImage, FeaturesCards } from '@components/hero';

export default function LandingPage() {
  const session = useSession();

  return (
    <>
      <HeroWithImage />

      <FeaturesCards />
    </>
  );
}
