import { PageProgressBar } from '@components/navigation-progress-bar';
import { SessionProviderWrapper } from '@components/session-provider';
import { ReactQueryProvider } from '@libs/query-client';
import { GlobalLoadingContainer } from '@libs/store/global-loading-store';
import { NavbarProvider } from '@libs/store/navbar-store/navbar-provider';
import { StoreKey } from '@libs/store/store-keys';
import { ColorSchemeScript, createTheme, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { authOptions } from 'app/api/auth/[...nextauth]/auth-options';
import { getServerSession } from 'next-auth';
import localFont from 'next/font/local';
import { cookies } from 'next/headers';
import Script from 'next/script';

import type { Metadata } from 'next';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';
import { CommonConstants } from '@libs/constants/common';
import { ModalsProvider } from '@mantine/modals';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'MyApp',
  description: 'Next.js, PrismaORM, Mantine을 사용하는 웹 애플리케이션 입니다..',
};

const theme = createTheme({
  breakpoints: {
    xs: '576px',
    sm: '854px',
    md: '992px',
    lg: '1200px',
    xl: '1408px',
  },
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const cookie = await cookies();
  const initialNavbarOpened = cookie.get(StoreKey.navbarOpened)?.value !== 'false';

  return (
    <html lang="ko" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript forceColorScheme="light" />
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MantineProvider theme={theme} forceColorScheme="light">
          <SessionProviderWrapper session={session}>
            <ReactQueryProvider>
              <NavbarProvider opened={initialNavbarOpened}>
                <ModalsProvider>
                  <GlobalLoadingContainer>{children}</GlobalLoadingContainer>
                </ModalsProvider>
              </NavbarProvider>
            </ReactQueryProvider>
          </SessionProviderWrapper>

          <Notifications zIndex={CommonConstants.zIndex.notification} />
          <PageProgressBar />
        </MantineProvider>
      </body>
    </html>
  );
}
