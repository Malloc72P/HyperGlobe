import type { Meta, StoryObj } from '@storybook/react-vite';
import { StorybookConstant } from '../../constants';
import { HyperGlobe } from './hyperglobe';
import { Graticule } from '../graticule';
import { Colors } from '../../lib/colors';

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
    hgmUrl: '/maps/nations-mid.hgm',
  },
};
