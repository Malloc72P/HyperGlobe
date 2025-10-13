import { Logo } from '@components/logo';
import classes from './landing-header.module.css';
import { Box, Flex } from '@mantine/core';
import { IconButton } from '@components/buttons/icon-button';
import { IconUserPlus } from '@tabler/icons-react';
import { useNavigator } from '@hooks/use-navigator';

export interface LandingHeaderProps {}

export function LandingHeader({}: LandingHeaderProps) {
  const navigator = useNavigator();

  return (
    <header className={classes.header}>
      <Logo />

      <Box flex={1}></Box>

      <Flex align={'center'} gap={'sm'}>
        <IconButton
          icon={IconUserPlus}
          variant="outline"
          radius={'xl'}
          tooltip="회원가입"
          onClick={() => {
            navigator.moveTo.auth.signup();
          }}
        />
      </Flex>
    </header>
  );
}
