import type { Meta, StoryObj } from '@storybook/react-vite';
import { StorybookConstant } from '../../constants';
import { HyperGlobe } from './hyperglobe';
import { Graticule } from '../graticule';

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
    children: (
      <>
        <Graticule />
      </>
    ),
  },
  //   parameters: {
  //     docs: {
  //       controls: { exclude: ['style'] },
  //     },
  //   },
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
};
