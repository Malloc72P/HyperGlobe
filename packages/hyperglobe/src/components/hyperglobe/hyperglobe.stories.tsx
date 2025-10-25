import type { Meta, StoryObj } from '@storybook/react-vite';
import { HyperGlobe } from './hyperglobe';
import { StorybookConstant } from '../../constants/storybook-constant';

const meta = {
  title: 'HyperGlobe',
  tags: ['autodocs'],
  component: HyperGlobe,
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GettingStarted: Story = {
  name: 'Getting Started',
  args: {
    ...StorybookConstant.props.HyperGlobe,
  },
};
