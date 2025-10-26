import type { Meta, StoryObj } from '@storybook/react-vite';
import { PolygonFeature } from './polygon-feature';
import { HyperGlobe } from '../..';
import { StorybookConstant } from '../../constants/storybook-constant';
import TestFeature from './test-polygon.json';
import type { Coordinate } from '../../types/coordinate';

const meta = {
  title: 'PolygonFeature',
  component: PolygonFeature,
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
} satisfies Meta<typeof PolygonFeature>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PolygonFeatureStory: Story = {
  name: 'PolygonFeature',
  args: {
    polygons: TestFeature.geometry.coordinates[0] as Coordinate[],
    color: 'blue',
    fill: true,
    fillColor: 'blue',
    fillOpacity: 0.3,
    lineWidth: 5,
  },
};
