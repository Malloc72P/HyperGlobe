import { CustomLink } from '@components/custom-link';
import { useUserMenuModel } from './use-user-menu-model';
import { ReactElement } from 'react';
import { Divider, Text } from '@mantine/core';
import classes from './user-menu.module.css';

export function UserMenu() {
  const { menuItems, isLoading } = useUserMenuModel();

  return (
    <>
      {menuItems.map(({ label, icon, type, color, onClick }) => {
        const key = [type, label].filter((v) => !!v).join('-');
        let component: ReactElement | null = null;

        switch (type) {
          case 'label':
            component = (
              <Text key={key} className={classes.label}>
                {label}
              </Text>
            );
            break;
          case 'divider':
            component = <Divider key={key} my={4} />;
            break;
          case 'button':
            component = <CustomLink key={key} link={{ label, icon, color, onClick: onClick }} />;
            break;
        }

        return component;
      })}
    </>
  );
}
