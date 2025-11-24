import type { Meta, StoryObj } from '@storybook/react';
import { RouteStoryComponent } from './route-feature-story';

/**
 * RouteFeature는 drei의 Line을 사용한 단순한 경로 렌더링 컴포넌트입니다.
 *
 * - 대권항로(Great Circle)를 따라 경로 생성
 * - 높이 프로필 적용 (포물선 형태)
 * - 선 굵기는 일정
 */
const meta = {
  title: 'Components/RouteFeature',
  component: RouteStoryComponent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RouteStoryComponent>;

export default meta;
1;
type Story = StoryObj<typeof meta>;

/**
 * 서울 → 런던 경로
 */
export const SeoulToLondon: Story = {
  args: {
    // from: [126.978, 37.5665], // 서울
    // to: [-0.1278, 51.5074], // 런던
    from: [-20, -40],
    to: [40, 35],
    minHeight: 0.01,
    maxHeight: 0.1,
    lineWidth: 5,
    segments: 300,
    animated: true,
    animationDuration: 5,
    animationDelay: 0.5,
    objectShape: 'arrow',
    style: {
      color: '#4A90E2',
      fillOpacity: 0.9,
    },
  },
  argTypes: {
    objectShape: {
      control: 'select',
      options: ['cone'],
    },
  },
};
