import { CommonConstants } from '@libs/constants/common';
import { ActionIcon, ActionIconProps, MantineColor, Tooltip, TooltipProps } from '@mantine/core';
import { Icon, IconProps } from '@tabler/icons-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

export interface IconButtonProps
  extends ActionIconProps,
    Omit<React.ComponentPropsWithoutRef<'button'>, keyof ActionIconProps> {
  onClick?: () => void;
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  secondIcon?: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  iconClass?: string;
  secondIconClass?: string;
  type?: 'submit' | 'reset' | 'button' | undefined;
  tooltip?: string;
  tooltipColor?: MantineColor;
  tooltipPosition?: TooltipProps['position'];
}

export function IconButton(props: IconButtonProps) {
  const {
    disabled,
    iconClass,
    type,
    secondIcon,
    secondIconClass,
    variant = 'light',
    tooltip,
    tooltipColor = 'blue',
    tooltipPosition = 'bottom',
    color = 'gray',
    ...actionIconProps
  } = props;

  return (
    <Tooltip
      withArrow
      position={tooltipPosition}
      arrowSize={12}
      hidden={!tooltip || disabled}
      label={tooltip}
      color={tooltipColor}
      zIndex={CommonConstants.zIndex.tooltip}
      transitionProps={{ transition: 'pop', duration: 300 }}
    >
      <ActionIcon
        disabled={disabled}
        type={type}
        aria-label="sidebar-toggle"
        variant={variant}
        color={color}
        {...actionIconProps}
      >
        <props.icon stroke={1.5} className={iconClass} />
        {props.secondIcon && <props.secondIcon stroke={1.5} className={secondIconClass} />}
      </ActionIcon>
    </Tooltip>
  );
}
