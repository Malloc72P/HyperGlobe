import type { Meta, StoryObj } from '@storybook/react-vite';
import { CameraTransitionDemo } from './camera-transition';

const meta = {
  title: 'Demos/Camera Transition',
  component: CameraTransitionDemo,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof CameraTransitionDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CameraTransition: Story = {
  name: '카메라 트랜지션',
  tags: ['autodocs'],
};
