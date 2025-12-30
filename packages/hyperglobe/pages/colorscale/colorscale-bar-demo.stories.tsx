import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorScaleBarDemo } from './colorscale-bar.demo';
import { DUMMY_CODE } from './colorscale-bar.demo.dummy';

const DUMMY = true;

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
    theme: 'blue',
  },
  argTypes: {
    theme: {
      control: 'select',
      options: ['blue', 'red', 'green'],
      description: '컬러 테마',
    },
  },
  parameters: {
    docs: {
      source: {
        code: DUMMY_CODE,
      },
    },
  },
};
