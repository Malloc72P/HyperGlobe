import type { Meta, StoryObj } from '@storybook/react-vite';
import { HyperGlobe } from './hyperglobe';
import { StorybookConstant } from '../../constants/storybook-constant';
import GeoJson from '../../data/world-low.geo.json';

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
    globeStyle: {
      color: '#E1E1E1',
      //   metalness: 0.3,
      //   roughness: 0.4,
    },
    regionStyle: {
      fill: true,
      lineWidth: 1.2,
      color: '#454545',
      fillColor: '#6794dc',
      //   metalness: 0.3,
      //   roughness: 0.4,
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
