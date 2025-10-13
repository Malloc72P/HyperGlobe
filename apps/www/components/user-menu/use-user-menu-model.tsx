'use client';

import { useNavigator } from '@hooks/use-navigator';
import { notifySuccess } from '@hooks/use-notification';
import { useGlobalLoadingStore } from '@libs/store/global-loading-store';
import { IconLogout, IconSettings } from '@tabler/icons-react';
import { signOut } from 'next-auth/react';
import { useMemo, useState } from 'react';

export interface UserMenuModel {
  type: 'button' | 'label' | 'divider';
  label: string;
  icon?: typeof IconSettings;
  color?: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function useUserMenuModel() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigator = useNavigator();
  const { setGlobalLoading } = useGlobalLoadingStore();

  const onLogoutClick = async () => {
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      timeoutId = setTimeout(() => setGlobalLoading(true), 150);
      await signOut();
      notifySuccess({ title: '로그아웃 성공', message: '로그아웃 되었습니다.' });
      navigator.moveTo.public.landing();
    } catch (error) {
      console.error(error);
    } finally {
      timeoutId && clearTimeout(timeoutId);
      setGlobalLoading(false);
    }
  };

  const onHomeClick = () => {
    navigator.moveTo.public.landing();
  };

  const menuItems = useMemo<UserMenuModel[]>(
    () => [
      //   { type: 'label', label: '내 페이지' },
      //   {
      //     type: 'button',
      //     label: '홈으로',
      //     icon: IconHome,
      //     onClick: onHomeClick,
      //   },
      //   { type: 'label', label: '계정' },
      //   {
      //     type: 'button',
      //     label: '계정 설정',
      //     icon: IconSettings,
      //     onClick: onAccountSettingClick,
      //   },
      {
        type: 'button',
        label: '로그아웃',
        icon: IconLogout,
        onClick: onLogoutClick,
      },
      //   { type: 'divider', label: 'divider' },
      //   {
      //     type: 'button',
      //     color: 'red',
      //     label: 'Delete account',
      //     icon: IconTrash,
      //     onClick: () => {},
      //   },
    ],
    [isLoading]
  );

  return {
    menuItems,
    isLoading,
  };
}
