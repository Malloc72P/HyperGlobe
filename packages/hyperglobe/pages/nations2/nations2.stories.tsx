import type { Meta, StoryObj } from '@storybook/react-vite';
import { Nations2Demo } from './nations2';
import { mapsInfo } from '@hyperglobe/maps';

const meta = {
  title: 'Demo/Nations2',

  component: Nations2Demo,
} satisfies Meta<typeof Nations2Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

const mapOptions = [...mapsInfo.map((map) => `${map.name}(${map.mb})`)];

export const Demo: Story = {
  name: '국가별 세계지도 2',
  tags: ['autodocs'],
  args: {
    theme: 'blue',
    map: mapOptions[3],
  },
  argTypes: {
    map: {
      control: 'select',
      options: mapOptions,
    },
  },
};
