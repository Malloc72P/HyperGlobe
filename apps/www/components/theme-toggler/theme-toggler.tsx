'use client';

import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import classes from './theme-toggler.module.css';
import { IconButton } from '@components/buttons/icon-button';

export function ThemeToggler() {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();

  const onTogglerClick = () => {
    toggleColorScheme();
  };

  return (
    <IconButton
      variant="transparent"
      tooltip={colorScheme === 'light' ? '다크모드 켜기' : '라이트모드 켜기'}
      icon={IconSun}
      secondIcon={IconMoon}
      iconClass={classes.light}
      secondIconClass={classes.dark}
      onClick={onTogglerClick}
    />
  );
}
