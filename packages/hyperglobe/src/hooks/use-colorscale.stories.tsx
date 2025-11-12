import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ColorScaleOptions } from './use-colorscale';
import { TooltipStoryComponent } from './colorscale-story';
import { Colors } from '../lib';

const meta = {
  title: 'Hooks/useColorScale',
  component: TooltipStoryComponent,
} satisfies Meta<ColorScaleOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ColorScaleStory: Story = {
  name: 'ColorScale',
  tags: ['autodocs'],
  args: {
    steps: [
      {
        to: 200,
        style: {
          fillColor: Colors.BLUE[2],
        },
      },
      {
        from: 200,
        to: 400,
        style: {
          fillColor: Colors.BLUE[3],
        },
      },
      {
        from: 400,
        to: 800,
        style: {
          fillColor: Colors.BLUE[4],
        },
      },
      {
        from: 800,
        style: {
          fillColor: Colors.BLUE[5],
        },
      },
    ],
  },
};
