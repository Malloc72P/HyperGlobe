import type { Meta, StoryObj } from '@storybook/react-vite';
import { HyperGlobe } from '../..';
import { StorybookConstant } from '../../constants/storybook-constant';
import { PolygonFeature } from './polygon-feature';

const meta = {
  title: 'Components/PolygonFeature',
  component: PolygonFeature,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <HyperGlobe
        {...StorybookConstant.props.HyperGlobe}
        textureEnabled={false}
        globeStyle={{
          color: 'white',
          metalness: 0.7,
          roughness: 0.7,
        }}
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
    polygons: [
      [-5, -5],
      [-5, 0],
      [-5, 5],
      [0, 5],
      [5, 5],
      [10, 0],
      [5, -5],
      [0, -5],
      [-5, -5],
    ],
    fill: true,
    style: {
      color: 'orange',
      fillColor: 'red',
      fillOpacity: 0.4,
      lineWidth: 3,
    },
  },
};
