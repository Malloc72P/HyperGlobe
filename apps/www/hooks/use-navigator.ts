'use client';

import { PageLinkMap } from '@libs/link-map';
import { useRouter } from 'next-nprogress-bar';

export const useNavigator = () => {
  const router = useRouter();

  return {
    moveTo: {
      auth: {
        login: () => router.push(PageLinkMap.auth.login()),
        signup: () => router.push(PageLinkMap.auth.signup()),
      },
      main: {
        home: () => router.push(PageLinkMap.main.home()),
      },
      public: {
        landing: () => router.push(PageLinkMap.public.landing()),
      },
      externalLink: {
        malloc72pGithub: () => window.open(PageLinkMap.externalLink.malloc72pGithub(), '_blank'),
        repository: () => window.open(PageLinkMap.externalLink.repository(), '_blank'),
      },
    },
  };
};
