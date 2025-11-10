import type { Meta, StoryObj } from '@storybook/react-vite';
import { StorybookConstant } from '../../constants';
import { HyperGlobe } from '../hyperglobe';
import { Graticule } from '../graticule';
import { Tooltip } from './tooltip';
import GeoJson from '../../data/world-low.geo.json';
import { RegionFeature } from '../';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TooltipStory: Story = {
  name: 'Tooltip',
  tags: ['autodocs'],
  args: {},
  decorators: [
    (Story) => (
      <HyperGlobe {...StorybookConstant.props.HyperGlobe} tooltipOption={{}}>
        {GeoJson.features.map((feature) => (
          <RegionFeature key={feature.id} feature={feature} />
        ))}
      </HyperGlobe>
    ),
  ],
};
