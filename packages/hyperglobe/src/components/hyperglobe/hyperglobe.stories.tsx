import type { Meta, StoryObj } from '@storybook/react-vite';
import { StorybookConstant } from '../../constants';
import { HyperGlobe } from './hyperglobe';

const meta = {
  title: 'Components/HyperGlobe',
  component: HyperGlobe,
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HyperGlobeStory: Story = {
  name: 'HyperGlobe',
  tags: ['autodocs'],
  args: {
    ...StorybookConstant.props.HyperGlobe,
  },
  //   parameters: {
  //     docs: {
  //       controls: { exclude: ['style'] },
  //     },
  //   },
  argTypes: {
    globeVisible: {
      table: {
        disable: true,
      },
    },
    coordinateSystemVisible: {
      table: {
        disable: true,
      },
    },
    textureEnabled: {
      table: {
        readonly: true,
      },
    },
  },
};
