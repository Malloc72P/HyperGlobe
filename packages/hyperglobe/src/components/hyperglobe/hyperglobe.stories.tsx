import type { Meta, StoryObj } from '@storybook/react-vite';
import { HyperGlobe } from './hyperglobe';

const meta = {
  title: 'HyperGlobe',
  component: HyperGlobe,
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GettingStarted: Story = {
  name: 'API',
  tags: ['autodocs'],
  args: {
    size: 500,
  },
};
