import type { Meta, StoryObj } from '@storybook/react';
import { RouteStoryComponent } from './route-feature-story';
import { Colors } from '../../lib';

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
    from: {
      coordinate: [127, 37],
      label: '서울',
      style: {
        fill: Colors.BLUE[5],
      },
    },
    to: {
      coordinate: [-122, 37.7749],
      label: '샌프란시스코',
      style: {
        fill: Colors.PINK[5],
      },
    },
    maxHeight: 0.1,
    lineWidth: 5,
    segments: 300,
    animated: true,
    animationDuration: 1,
    animationDelay: 0.5,
    style: {
      fill: Colors.BLUE[5],
    },
  },
};
