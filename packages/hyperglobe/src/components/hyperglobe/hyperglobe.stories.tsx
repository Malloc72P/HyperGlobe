import type { Meta, StoryObj } from '@storybook/react-vite';
import { HyperGlobe, type HyperGlobeProps } from './hyperglobe';
import { StorybookConstant } from '../../constants/storybook-constant';
import GeoJson from '../../data/world-low.geo.json';
import { gray } from '../../lib';
import { Graticule } from '../graticule';
import { RegionFeature } from '../region-feature';

const meta = {
  title: 'Components/HyperGlobe',
  component: HyperGlobe,
  argTypes: {
    children: {
      control: false,
    },

    defaultIndex: {
      control: false,
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ height: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

const compositionTemplate = () => {
  const styles = {
    globeColor: '#b0b0b0',
    regionFill: '#6d6d6d',
    regionColor: '#808080',
    metalness: 0.7,
    roughness: 0.3,
  };

  return (
    <HyperGlobe
      size={900}
      textureEnabled={false}
      globeStyle={{
        color: styles.globeColor,
        metalness: styles.metalness,
        roughness: styles.roughness,
      }}
    >
      <Graticule />
      {GeoJson.features.map((feature) => (
        <RegionFeature
          key={feature.id}
          feature={feature}
          fill={true}
          lineWidth={1.5}
          color={styles.regionColor}
          fillColor={styles.regionFill}
          metalness={styles.metalness}
          roughness={styles.roughness}
        />
      ))}
    </HyperGlobe>
  );
};

export const Overview = {
  render: () => <HyperGlobe />,
  name: 'Overview',
  args: {},
  parameters: {
    docs: {
      liveEdit: {
        isEnabled: false,
      },
      source: {
        code: `<HyperGlobe />`,
      },
    },
  },
};

export const Composition = {
  render: compositionTemplate,
  name: 'Composition',
  args: {},
  tags: ['!dev'], // 사이드바에서 숨김
  parameters: {
    docs: {
      liveEdit: {
        isEnabled: false,
      },
      source: {
        code: `export function MyGlobe() {
  const styles = {
    globeColor: '#b0b0b0',
    regionFill: '#6d6d6d',
    regionColor: '#808080',
    metalness: 0.7,
    roughness: 0.3,
  };

  return (
    <HyperGlobe
      size={900}
      textureEnabled={false}
      globeStyle={{
        color: styles.globeColor,
        metalness: styles.metalness,
        roughness: styles.roughness,
      }}
    >
      <Graticule />
      {GeoJson.features.map((feature) => (
        <RegionFeature
          key={feature.id}
          feature={feature}
          fill={true}
          lineWidth={1.5}
          color={styles.regionColor}
          fillColor={styles.regionFill}
          metalness={styles.metalness}
          roughness={styles.roughness}
        />
      ))}
    </HyperGlobe>
  );
}`,
      },
    },
  },
};

export default meta;
