'use client';

import { cn } from '@libs/ui';
import { Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { ReactElement, useState } from 'react';
import { useUserMenuModel } from './use-user-menu-model';
import classes from './user-menu-dropdown.module.css';
import { CommonConstants } from '@libs/constants/common';

export interface UserMenuDropdownProps {}

export function UserMenuDropdown({}: UserMenuDropdownProps) {
  const { data: profile } = useSession();

  const userMenuModel = useUserMenuModel();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  return (
    <>
      <Menu
        width={260}
        position="bottom-end"
        transitionProps={{ transition: 'pop-top-right' }}
        onClose={() => setUserMenuOpened(false)}
        onOpen={() => setUserMenuOpened(true)}
        zIndex={CommonConstants.zIndex.dropdown}
        withinPortal
      >
        {/* 
        //-------------------------------------------------------------------------
        // DropDown Trigger
        //-------------------------------------------------------------------------*/}
        <Menu.Target>
          <UnstyledButton className={cn(classes.user, classes.userActive)}>
            <Group gap={7}>
              {/* <Avatar src={user.image} alt={user.name} radius="xl" size={20} /> */}
              <Text fw={500} size="sm" lh={1} mr={3}>
                {profile?.user.name}
              </Text>
              <IconChevronDown size={12} stroke={1.5} />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        {/*
         //-------------------------------------------------------------------------
         // DropDown Body
         //-------------------------------------------------------------------------*/}
        <Menu.Dropdown>
          {userMenuModel.menuItems.map((item) => {
            const key = [item.type, item.label].filter((v) => v).join('-');
            let component: ReactElement | null = null;

            switch (item.type) {
              case 'label':
                component = <Menu.Label key={key}>{item.label}</Menu.Label>;
                break;
              case 'divider':
                component = <Menu.Divider key={key} />;
                break;
              case 'button':
                component = (
                  <Menu.Item
                    key={key}
                    leftSection={item.icon && <item.icon size={16} stroke={1.5} />}
                    onClick={item.onClick}
                    color={item.color}
                    disabled={item.disabled || item.loading}
                  >
                    {item.label}
                  </Menu.Item>
                );
                break;
            }

            return component;
          })}
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
