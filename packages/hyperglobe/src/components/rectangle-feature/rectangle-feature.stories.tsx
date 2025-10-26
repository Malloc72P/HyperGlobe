import type { Meta, StoryObj } from '@storybook/react-vite';
import { RectangleFeature } from './rectangle-feature';
import { HyperGlobe } from '../..';
import { StorybookConstant } from '../../constants/storybook-constant';

const meta = {
  title: 'Components/RectangleFeature',
  component: RectangleFeature,
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
} satisfies Meta<typeof RectangleFeature>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FeatureStory: Story = {
  name: 'RectangleFeature',
  args: {
    coordinates: [
      [-10, 10],
      [10, 10],
      [10, -10],
      [-10, -10],
    ],
    color: 'blue',
    fill: true,
    fillColor: 'blue',
    fillOpacity: 0.3,
    lineWidth: 5,
  },
};

export const FilledRectangle: Story = {
  name: 'Filled Rectangle',
  args: {
    coordinates: [
      [-10, 10],
      [10, 10],
      [10, -10],
      [-10, -10],
    ],
    color: 'blue',
    lineWidth: 3,
    fill: true,
    fillColor: 'blue',
    fillOpacity: 0.3,
    subdivisions: 10,
  },
};

export const HighSubdivision: Story = {
  name: 'High Subdivision (Smoother Surface)',
  args: {
    coordinates: [
      [-30, 30],
      [30, 30],
      [30, -30],
      [-30, -30],
    ],
    color: 'red',
    lineWidth: 2,
    wireframe: true,
    fill: true,
    fillColor: 'red',
    fillOpacity: 0.5,
    subdivisions: 20,
  },
};
