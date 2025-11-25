import type { Meta, StoryObj } from '@storybook/react';
import { AirlineStory } from './airline';

/**
 *
 */
const meta = {
  title: 'Demo/Airline',
  component: AirlineStory,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AirlineStory>;

export default meta;
1;
type Story = StoryObj<typeof meta>;

/**
 * 서울 → 런던 경로
 */
export const AirLineStoryMeta: Story = {
  args: {},
};
