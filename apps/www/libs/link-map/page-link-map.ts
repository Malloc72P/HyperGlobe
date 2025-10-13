export const PageLinkMap = {
  auth: {
    login: (message?: string) => `/login${message ? `?m=${encodeURIComponent(message)}` : ''}`,
    signup: () => '/signup',
  },
  main: {
    home: () => '/home',
  },
  public: {
    landing: () => '/',
  },
  externalLink: {
    malloc72pGithub: () => 'https://github.com/malloc72P',
    repository: () => `https://github.com/Malloc72P/next-prisma-mantine`,
  },
} as const;
