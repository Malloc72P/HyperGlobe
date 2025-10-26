import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionFeature } from './region-feature';
import { HyperGlobe } from '../..';
import { StorybookConstant } from '../../constants/storybook-constant';
import world from './world-low.geo.json';

const meta = {
  title: 'RegionFeature',
  component: RegionFeature,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <HyperGlobe
        {...StorybookConstant.props.HyperGlobe}
        //   wireframe
      >
        {Story()}
      </HyperGlobe>
    ),
  ],
} satisfies Meta<typeof RegionFeature>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FeatureStory: Story = {
  name: 'RegionFeature',
  args: {
    feature: world.features[0] as any,
    color: 'blue',
    fill: true,
    fillColor: 'blue',
    fillOpacity: 0.3,
    lineWidth: 5,
  },
};
