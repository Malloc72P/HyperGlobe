import type { Meta, StoryObj } from '@storybook/react-vite';
import { RegionFeature } from './region-feature';
import { HyperGlobe } from '../..';
import { StorybookConstant } from '../../constants/storybook-constant';
import world from '../../data/world-low.geo.json';

const meta = {
  title: 'Components/RegionFeature',
  component: RegionFeature,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <HyperGlobe
        {...StorybookConstant.props.HyperGlobe}
        rotation={[-Math.PI * 0.03, Math.PI * 0.84, 0]}
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
    color: 'white',
    fill: true,
    fillColor: 'black',
    fillOpacity: 0.8,
    lineWidth: 7,
  },
};
