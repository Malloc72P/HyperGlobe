import { IconUser } from '@tabler/icons-react';

export interface CustomLinkModel {
  label: string;
  icon?: typeof IconUser;
  color?: string;
  onClick?: () => void;
}
