import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ColorScaleOptions } from './use-colorscale';
import { ColorScaleStoryComponent } from './colorscale-story';
import { Colors } from '../lib';
import { snippets } from './use-colorscale-snippets';

const meta = {
  title: 'Hooks/useColorScale',
  component: ColorScaleStoryComponent,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ColorScaleStory: Story = {
  name: 'ColorScale',
  tags: ['autodocs'],
  args: {
    steps: [],
  },
  parameters: { docs: { source: { code: snippets } } },
};
