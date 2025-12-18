import type { Meta, StoryObj } from '@storybook/react';
import { RoundTheWorld, RoundTheWorldProps } from './round-the-world.demo';
import { DUMMY_CODE } from './round-the-world.demo.dummy';

const DUMMY = true;

const meta = {
  title: 'Demo/RoundTheWorld',
  component: RoundTheWorld,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<RoundTheWorldProps>;

export default meta;
1;
type Story = StoryObj<typeof meta>;

export const RoundTheWorldStoryMeta: Story = {
  args: {},
  parameters: {
    docs: {
      source: {
        code: DUMMY_CODE,
      },
    },
  },
};
