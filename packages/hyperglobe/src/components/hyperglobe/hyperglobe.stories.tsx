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
    regionStyle: {
      fill: true,
      fillColor: '#78a9e2',
      //   fillOpacity: 0.9,
      color: '#3a5dbb',
      //   wireframe: true,
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
