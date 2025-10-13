import { SourceCodeState } from '@libs/store/chat-store';
import { Overlay, Card, Flex, Text } from '@mantine/core';
import { IconAlertCircleFilled } from '@tabler/icons-react';
import { ReactElement, useMemo } from 'react';

export interface WarningOverlayProps {
  errorState: SourceCodeState;
}

export function WarningOverlay({ errorState }: WarningOverlayProps) {
  const errorMessage: ReactElement = useMemo(() => {
    let message: ReactElement = <>소스 코드에 오류가 있습니다. 코드를 수정해주세요.</>;

    switch (errorState) {
      case 'refError':
        message = (
          <>
            참조 오류가 발생했습니다. <br /> 세션에 연결되지 않은 데이터셋이 있는지 확인해주세요.
          </>
        );
        break;
    }

    return message;
  }, [errorState]);

  return (
    <Overlay backgroundOpacity={0.85}>
      <Card
        shadow="xl"
        withBorder
        radius="lg"
        p="xl"
        pos="absolute"
        w="60%"
        h="60%"
        maw={600}
        mah={300}
        style={{ zIndex: 9999, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <Flex gap="sm">
          <IconAlertCircleFilled />
          <Text>{errorMessage}</Text>
        </Flex>
      </Card>
    </Overlay>
  );
}
