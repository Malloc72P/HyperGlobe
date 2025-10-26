import type { Meta, StoryObj } from '@storybook/react-vite';
import { PolygonFeature } from './polygon-feature';
import { HyperGlobe } from '../..';
import { StorybookConstant } from '../../constants/storybook-constant';
import TestFeature from '../../data/test-polygon.json';
import type { Coordinate } from '../../types/coordinate';

const meta = {
  title: 'Components/PolygonFeature',
  component: PolygonFeature,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <HyperGlobe
        {...StorybookConstant.props.HyperGlobe}
        rotation={[-Math.PI / 10, -Math.PI / 6, 0]}
        // coordinateSystemVisible
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
    color: '#6d6d6d',
    fill: true,
    fillColor: 'white',
    fillOpacity: 0.7,
    lineWidth: 5,
  },
};
