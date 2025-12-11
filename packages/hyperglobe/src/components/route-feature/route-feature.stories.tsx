import type { Meta, StoryObj } from '@storybook/react';
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
        animationDuration: 3000,
        animationDelay: 0.5,
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
