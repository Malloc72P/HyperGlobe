'use client';

import { Container, Title, Text, Card, Divider, Box, Flex, Button, Overlay } from '@mantine/core';
import { IconBug, IconCarCrash } from '@tabler/icons-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  let message = error.message || '알 수 없는 오류가 발생했습니다.';

  return (
    <Overlay w={'100vw'} h={'100vh'} zIndex={1000}>
      <Card withBorder shadow="sm" p="xl" radius="md" maw={500} mt="20vh" mx="auto">
        <Box mih={300}>
          <Title size={24} mb={'xs'}>
            <Flex align={'center'} gap="xs">
              <IconCarCrash size={32} stroke={1.5} />
              문제가 발생했습니다...
            </Flex>
          </Title>

          <Divider mb="md" />
          <Text>{message}</Text>
          <Text>증상이 계속되면 관리자에게 문의해주세요.</Text>
        </Box>

        <Flex justify={'end'}>
          <Button onClick={() => reset()}>새로고침</Button>
        </Flex>
      </Card>
    </Overlay>
  );
}
