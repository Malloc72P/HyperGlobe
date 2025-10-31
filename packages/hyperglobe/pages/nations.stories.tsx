import type { Meta, StoryObj } from '@storybook/react-vite';
import { NationsDemo } from './nations';
import fs from 'fs';

const meta = {
  title: 'Demo/Nations',

  component: NationsDemo,
} satisfies Meta<typeof NationsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  name: '국가별 세계지도',
  tags: ['autodocs', '!dev'],
  parameters: {
    docs: {
      source: {
        code: `import { useMemo } from 'react';
import { HyperGlobe, Graticule, RegionFeature } from 'hyperglobe';
import GeoJson from '../src/data/world-low.geo.json';

const pink = [
  '#fff1f3',
  '#ffe3e7',
  '#ffc0cb',
  '#ffa2b3',
  '#fe6e8b',
  '#f83b66',
  '#e51951',
  '#c20e43',
  '#a20f40',
  '#8a113c',
  '#4d041c',
];
const blue = [
  '#f2f6fc',
  '#e0ebf9',
  '#c9dcf4',
  '#a4c6ec',
  '#78a9e2',
  '#6794dc',
  '#4470cc',
  '#3a5dbb',
  '#354c98',
  '#2f4279',
  '#212a4a',
];

const gray = [
  '#f6f6f6',
  '#e7e7e7',
  '#d1d1d1',
  '#b0b0b0',
  '#808080',
  '#6d6d6d',
  '#5d5d5d',
  '#4f4f4f',
  '#454545',
  '#3d3d3d',
  '#262626',
];

const colorThemes = {
  pink,
  blue,
  gray,
};

export interface NationsDemoProps {
  theme?: 'pink' | 'blue' | 'gray';
}

export function NationsDemo({ theme = 'gray' }: NationsDemoProps) {
  const color = useMemo(() => {
    return colorThemes[theme];
  }, [theme]);

  const styles = {
    globeColor: color[3],
    regionFill: color[5],
    regionColor: color[4],
    metalness: 0.7,
    roughness: 0.3,
  };

  return (
    <HyperGlobe
      maxSize={900}
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
}
`,
      },
    },
  },
};
