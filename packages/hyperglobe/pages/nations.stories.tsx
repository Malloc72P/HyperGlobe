import type { Meta, StoryObj } from '@storybook/react-vite';
import { NationsDemo } from './nations';
import fs from 'fs';

const meta = {
  title: 'Demo/Nations',

  component: NationsDemo,
} satisfies Meta<typeof NationsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  name: '국가별 세계지도',
  tags: ['autodocs', '!dev'],
};
