import type { Meta, StoryObj } from '@storybook/react';
import { HyperGlobe } from './hyperglobe';

const meta: Meta<typeof HyperGlobe> = {
  title: 'Components/HyperGlobe',
  component: HyperGlobe,
  parameters: {
    layout: 'centered',
  },
  args: {
    hgmUrl: 'https://unpkg.com/@malloc72p/hyperglobe-maps/dist/nations-mid.hgm',
  },
};

export default meta;
type Story = StoryObj<typeof HyperGlobe>;

export const Intro: Story = {
  args: {
    hgmUrl: 'https://unpkg.com/@malloc72p/hyperglobe-maps/dist/nations-mid.hgm',
    tooltip: true,
    graticule: true,
    style: { maxWidth: 400 },
    onReady: () => console.log('렌더링 완료'),
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 100, max: 800, step: 10 },
      description: '지구본의 크기 (픽셀)',
    },
  },
};

export const Globe: Story = {
  args: {
    globe: {
      style: {
        color: '#e0ebf9',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 100, max: 800, step: 10 },
      description: '지구본의 크기 (픽셀)',
    },
  },
};

export const Size: Story = {
  args: {
    size: 400,
    maxSize: 500,
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 100, max: 500, step: 50 },
    },
    maxSize: {
      control: { type: 'range', min: 100, max: 500, step: 50 },
    },
  },
  parameters: {
    controls: {
      include: ['size', 'maxSize'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: 500 }}>
        <Story />
      </div>
    ),
  ],
};

export const Camera: Story = {
  args: {
    camera: {
      initialPosition: [126.978, 37.5665],
      minDistance: 1.5,
      maxDistance: 10,
    },
    size: 500,
  },
  parameters: {
    controls: {
      include: ['camera'],
    },
  },
};

export const Control: Story = {
  args: {
    controls: {
      enablePan: true,
      enableZoom: true,
      enableRotate: true,
    },
    size: 500,
  },
  parameters: {
    controls: {
      include: ['controls'],
    },
  },
};
