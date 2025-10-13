import { Box, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { IconButton } from '@components/buttons/icon-button';
import { Logo } from '@components/logo';
import { useUserMenuModel } from '@components/user-menu/use-user-menu-model';
import { IconMenu } from '@tabler/icons-react';
import classes from './main-header.module.css';

export interface MainHeaderProps {
  menuEnabled?: boolean;
  opened?: boolean;
  toggle?: () => void;
}

export function MainHeader({ menuEnabled = false, opened }: MainHeaderProps) {
  const { menuItems } = useUserMenuModel();

  return (
    <header className={classes.header} data-menu-enabled={menuEnabled} data-opened={opened}>
      <Logo />

      <Box flex={1}></Box>

      <Flex align="center" gap="xs">
        {menuItems.map((item, index) => (
          <IconButton
            key={index}
            variant="transparent"
            tooltip={item.label}
            icon={item.icon ?? IconMenu}
            onClick={item.onClick}
          />
        ))}
      </Flex>
    </header>
  );
}
