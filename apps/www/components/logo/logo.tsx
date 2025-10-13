'use client';

import { useNavigator } from '@hooks/use-navigator';
import { cn } from '@libs/ui';
import { Badge, Flex, FlexProps, MantineColor, Text } from '@mantine/core';
import { IconTopologyFullHierarchy } from '@tabler/icons-react';
import classes from './logo.module.css';

export interface LogoProps
  extends FlexProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof FlexProps> {
  size?: 'lg' | 'sm';
  clickDisabled?: boolean;
  isDevMode?: boolean;
  badge?: {
    label: string;
    color: MantineColor;
  };
}

export function Logo({
  size = 'lg',
  clickDisabled,
  isDevMode = false,
  badge,
  ...props
}: LogoProps) {
  const navigator = useNavigator();

  return (
    <Flex
      className={cn(classes.logo, 'myapp-logo')}
      data-click-disabled={clickDisabled ? 'true' : 'false'}
      align={'center'}
      gap={'xs'}
      onClick={() => {
        if (clickDisabled) return;

        navigator.moveTo.public.landing();
      }}
      {...props}
    >
      <Flex align={'center'} justify={'center'} className={classes.logoIcon}>
        <IconTopologyFullHierarchy color="white" strokeWidth={1.5} size={28} />
      </Flex>

      <Flex direction={'column'}>
        <Flex align={'center'} gap={5}>
          <Text size={size === 'lg' ? 'xl' : 'md'} className={cn(classes.logoTop)} c={'dark'}>
            MyApp
          </Text>
          {isDevMode && (
            <Badge size="xs" bg={'red.7'}>
              DEV
            </Badge>
          )}
          {badge && (
            <Badge size="xs" bg={badge.color}>
              {badge.label}
            </Badge>
          )}
        </Flex>
        <Text size={'xs'} className={cn(classes.logoBottom)} c={'gray.6'}>
          풀스택 웹서비스 템플릿
        </Text>
      </Flex>
    </Flex>
  );
}
