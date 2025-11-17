import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ColorScaleOptions } from './use-colorscale';
import { ColorScaleStoryComponent } from './colorscale-story';
import { Colors } from '../lib';
import { snippets } from './use-colorscale-snippets';

const meta = {
  title: 'Hooks/useColorScale',
  component: ColorScaleStoryComponent,
} satisfies Meta<ColorScaleOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ColorScaleStory: Story = {
  name: 'ColorScale',
  tags: ['autodocs'],
  args: {
    steps: [
      { to: -10, style: { fillColor: '#ff5757' } },
      { from: -10, to: 0, style: { fillColor: '#ffc0c0' } },
      { from: 0, to: 1, style: { fillColor: '#f2f6fc' } },
      { from: 1, to: 3, style: { fillColor: '#c9dcf4' } },
      { from: 3, to: 5, style: { fillColor: '#a4c6ec' } },
      { from: 5, style: { fillColor: '#78a9e2' } },
    ],
    nullStyle: {
      fillColor: Colors.GRAY[3],
    },
  },
  parameters: { docs: { source: { code: snippets } } },
};
