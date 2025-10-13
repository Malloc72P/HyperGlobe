'use client';

import { Box, Flex, Loader, LoadingOverlay, Text } from '@mantine/core';
import { memo, PropsWithChildren, useMemo } from 'react';
import { useGlobalLoadingStore } from './global-loading-store';
import { CommonConstants } from '@libs/constants/common';

const overlayStyle = {
  height: '100vh',
  overflow: 'hidden',
};

export function GlobalLoadingContainer({ children }: PropsWithChildren) {
  const { globalLoading } = useGlobalLoadingStore();

  /**
   * 로딩 컴포넌트의 props
   * useMemo를 사용해서 불필요한 리랜더링 방지
   * 로딩 컴포넌트는 상태가 변경되지 않기 때문에
   * 매번 새로 생성할 필요가 없음
   */
  const loaderProps = useMemo(
    () => ({
      children: <LoaderContent />,
    }),
    []
  );

  return (
    <Box pos="relative" style={globalLoading ? overlayStyle : undefined}>
      <LoadingOverlay
        zIndex={CommonConstants.zIndex.globalLoading}
        visible={globalLoading}
        loaderProps={loaderProps}
      />
      {children}
    </Box>
  );
}

/**
 * 로딩 컴포넌트
 * memo를 사용해서 컴포넌트 자체의 불필요한 리랜더링 방지
 */
const LoaderContent = memo(() => (
  <Flex direction="column" gap="md" align="center">
    <Loader type="bars"></Loader>
    <Text fw="bold" size="xl">
      로딩중...
    </Text>
  </Flex>
));
