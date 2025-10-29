import type { Meta, StoryObj } from '@storybook/react-vite';
import { HyperGlobe } from './hyperglobe';
import { StorybookConstant } from '../../constants/storybook-constant';
import GeoJson from '../../../public/world-low.geo.json';

const meta = {
  title: 'Components/HyperGlobe',
  tags: ['autodocs'],
  component: HyperGlobe,
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GettingStarted: Story = {
  name: 'Getting Started',
  args: {
    ...StorybookConstant.props.HyperGlobe,
  },
};

export const MapData: Story = {
  name: 'Map Data',
  args: {
    ...StorybookConstant.props.HyperGlobe,
    mapData: GeoJson as any,
    textureEnabled: false,
    globeColor: '#3d3d3d',
    regionStyle: {
      fill: true,
      lineWidth: 1.2,
      color: '#bb5502',
      fillColor: 'white',
    },
  },
};

export const LoadingUI: Story = {
  name: 'Loading UI',
  args: {
    ...StorybookConstant.props.HyperGlobe,
    loading: true,
  },
};
