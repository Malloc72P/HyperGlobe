'use client';

import { CommonConstants } from '@libs/constants/common';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { ReactNode } from 'react';

export interface NotifyParam {
  title?: string;
  message: ReactNode;
}

export function notifySuccess({ title, message }: NotifyParam) {
  notifications.show({
    icon: <IconCheck size={20} />,
    title,
    message,
    color: 'blue',
    position: 'top-center',
    withBorder: true,
    mih: '80px',
  });
}

export function notifyError({ title, message }: NotifyParam) {
  notifications.show({
    icon: <IconX size={20} />,
    title,
    message,
    color: 'red',
    position: 'top-center',
    withBorder: true,
    mih: '80px',
  });
}
