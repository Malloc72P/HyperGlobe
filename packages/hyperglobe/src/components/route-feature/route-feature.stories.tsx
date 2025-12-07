import type { Meta, StoryObj } from '@storybook/react';
import { RouteStoryComponent } from './route-feature-story';
import { Colors } from '../../lib';
import { HyperGlobe } from '../hyperglobe';
import { StorybookConstant } from '../../constants';

/**
 * RouteFeature는 drei의 Line을 사용한 단순한 경로 렌더링 컴포넌트입니다.
 *
 * - 대권항로(Great Circle)를 따라 경로 생성
 * - 높이 프로필 적용 (포물선 형태)
 * - 선 굵기는 일정
 */
const meta = {
  title: 'Components/RouteFeature',
  component: HyperGlobe,
  parameters: {
    layout: 'fullscreen',
  },
  //   tags: ['autodocs'],
} satisfies Meta<typeof HyperGlobe>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * 서울 → 런던 경로
 */
export const SeoulToLondon: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    camera: {
      initialPosition: [183, 37],
    },
    routes: [
      {
        id: 'seoul-to-sanfrancisco',
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
      },
    ],
    graticule: true,
  },
  parameters: {
    controls: {
      include: ['routes'],
    },
  },
};

/**
 * 스타일 커스터마이징
 */
export const StyledRoute: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    camera: {
      initialPosition: [183, 37],
    },
    routes: [
      {
        id: 'styled-route',
        from: {
          coordinate: [127, 37],
          label: 'Start',
        },
        to: {
          coordinate: [-122, 37.7749],
          label: 'End',
        },
        maxHeight: 0.2,
        lineWidth: 10,
        style: {
          color: Colors.GRAY[5],
        },
        animated: false,
      },
    ],
  },
  parameters: {
    controls: {
      include: ['routes'],
    },
  },
};

/**
 * 애니메이션 설정
 */
export const AnimatedRoute: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    camera: {
      initialPosition: [183, 37],
      minDistance: 8,
    },
    routes: [
      {
        id: 'fast-route',
        from: { coordinate: [127, 37], label: 'Fast' },
        to: { coordinate: [-122, 37.7749], label: 'End' },
        maxHeight: 0.15,
        lineWidth: 3,
        style: { color: Colors.GRAY[5] },
        animated: true,
        animationDuration: 0.5, // 0.5초 (빠름)
        animationDelay: 0,
      },
      {
        id: 'slow-route',
        from: { coordinate: [127, 37], label: 'Slow' },
        to: { coordinate: [0, 51.5074], label: 'London' },
        maxHeight: 0.15,
        lineWidth: 3,
        style: { color: Colors.GRAY[5] },
        animated: true,
        animationDuration: 3, // 3초 (느림)
        animationDelay: 1, // 1초 딜레이
      },
    ],
  },
  parameters: {
    controls: {
      include: ['routes'],
    },
  },
};
