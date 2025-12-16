import type { Meta, StoryObj } from '@storybook/react';
import { HyperGlobe } from '../hyperglobe';
import { CameraTransitionDemo } from './camera-transition-demo';
import { CameraTransitionDemoCode } from './camera-transition-demo.code';

export const DUMMY = true;

/**
 * CameraTransition은 지구본 카메라를 경로를 따라 자동으로 이동시키는 API입니다.
 *
 * - 대권항로(Great Circle)를 따라 부드럽게 이동
 * - 여러 지점을 순차적으로 방문
 * - 이징 함수를 통한 애니메이션 커스터마이징
 * - 진행 콜백 및 완료 콜백 지원
 */
const meta = {
  title: 'API/CameraTransition',
  component: HyperGlobe,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 카메라 트랜지션
 */
export const Basic = {
  render: () => <CameraTransitionDemo />,
  parameters: {
    docs: {
      source: {
        code: CameraTransitionDemoCode,
      },
    },
  },
};
