import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorScaleBarDemo } from './colorscale-bar-demo';

const meta = {
  title: 'Demo/ColorScaleBar',
  component: ColorScaleBarDemo,
} satisfies Meta<typeof ColorScaleBarDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  name: 'ColorScaleBar 데모',
  tags: ['autodocs'],
  args: {
    formatType: 'fixed',
    theme: 'blue',
  },
  argTypes: {
    formatType: {
      control: 'select',
      options: ['default', 'locale', 'fixed'],
      description: '레이블 포맷 방식',
    },
    theme: {
      control: 'select',
      options: ['blue', 'red', 'green'],
      description: '컬러 테마',
    },
  },
};
