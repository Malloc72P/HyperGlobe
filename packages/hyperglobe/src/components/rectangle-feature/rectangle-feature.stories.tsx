import type { Meta, StoryObj } from '@storybook/react-vite';
import { RectangleFeature } from './rectangle-feature';
import { HyperGlobe } from '../..';
import { StorybookConstant } from '../../constants/storybook-constant';

const meta = {
  title: 'RectangleFeature',
  component: RectangleFeature,
  tags: ['autodocs'],
  decorators: [
    (Story) => <HyperGlobe {...StorybookConstant.props.HyperGlobe}>{Story()}</HyperGlobe>,
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
    lineWidth: 5,
  },
};
