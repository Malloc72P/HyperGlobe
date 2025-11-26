import type { Meta, StoryObj } from '@storybook/react';
import { MarkerStoryComponent } from './marker-feature-story';

/**
 * MarkerFeature는 Html 컴포넌트를 사용하여 소수의 중요 지점을 마커와 라벨로 표시하는 컴포넌트입니다.
 *
 * - SVG 아이콘 지원
 * - 텍스트 라벨 표시
 * - 자동 Billboard (항상 카메라를 향함)
 * - 지구 반대편에서 자동으로 가려짐
 * - 클릭/호버 이벤트 지원
 * - 50개 이하의 마커에 적합
 */
const meta = {
  title: 'Components/MarkerFeature',
  component: MarkerStoryComponent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MarkerStoryComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 주요 도시를 표시하는 기본 예제
 */
export const MajorCities: Story = {
  args: {
    marker: {
      position: [126.978, 37.5665], // 서울
      label: '서울',
      icon: 'circle',
      stroke: 'black',
      fill: '#ff5722',
    },
    showLabels: true,
    defaultScale: 1,
  },
};
