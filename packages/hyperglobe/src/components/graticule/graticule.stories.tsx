import type { Meta, StoryObj } from '@storybook/react-vite';
import { HyperGlobe } from '../..';
import { StorybookConstant } from '../../constants/storybook-constant';
import { Graticule } from './graticule';

const meta = {
  title: 'Components/Graticule',
  component: Graticule,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <HyperGlobe
        {...StorybookConstant.props.HyperGlobe}
        coordinateSystemVisible
        // wireframe
        // globeVisible={false}
      >
        {Story()}
      </HyperGlobe>
    ),
  ],
} satisfies Meta<typeof Graticule>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GraticuleStory: Story = {
  name: 'Graticule',
  args: {
    latitudeStep: 10,
    longitudeStep: 10,
  },
};
