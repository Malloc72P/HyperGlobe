import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './tooltip';
import { TooltipStoryComponent } from './tooltip-story';

const meta = {
  title: 'Components/Tooltip',
  component: TooltipStoryComponent,
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TooltipStory: Story = {
  name: 'Tooltip',
  tags: ['autodocs'],
  args: {
    styles: {
      idStyle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
      },
      nameStyle: {
        fontSize: 16,
        color: 'white',
      },
      rootStyle: {
        background: '#2b2b2b',
        padding: '5px 8px',
        minHeight: 0,
      },
    },
  },
};
