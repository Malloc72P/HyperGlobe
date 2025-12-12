import type { Meta, StoryObj } from '@storybook/react';
import { Colors } from '../../lib';
import { HyperGlobe } from '../hyperglobe';
import { StorybookConstant } from '../../constants';

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
  component: HyperGlobe,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 주요 도시를 표시하는 기본 예제
 */
export const MajorCities: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    camera: {
      initialPosition: [127, 37],
    },
    marker: {
      items: [
        {
          id: 'seoul',
          coordinate: [126.978, 37.5665],
          label: '서울',
          icon: 'pin',
          style: {
            fill: Colors.PINK[5],
            stroke: Colors.GRAY[10],
          },
        },
        {
          id: 'tokyo',
          coordinate: [139.6917, 35.6895],
          label: '도쿄',
          icon: 'pin',
          style: {
            fill: Colors.BLUE[5],
            stroke: Colors.GRAY[10],
          },
        },
        {
          id: 'beijing',
          coordinate: [116.4074, 39.9042],
          label: '베이징',
          icon: 'pin',
          style: {
            fill: Colors.GRAY[5],
            stroke: Colors.GRAY[10],
          },
        },
      ],
    },
  },
  parameters: {
    controls: {
      include: ['marker'],
    },
  },
};

/**
 * 커스텀 아이콘 경로 사용
 */
export const CustomIcon: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    camera: {
      initialPosition: [0, 51],
    },
    marker: {
      items: [
        {
          id: 'london',
          coordinate: [-0.1276, 51.5074],
          label: '런던 (Star)',
          // 별 모양 SVG path
          icon: 'custom',
          iconPath:
            'M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z',
          style: {
            fill: Colors.GRAY[3],
            stroke: Colors.GRAY[7],
            scale: 1.5,
          },
        },
        {
          id: 'romania',
          coordinate: [26.1025, 44.4268],
          label: '루마니아 (Heart)',
          // 하트 모양 SVG path
          icon: 'custom',
          iconPath:
            'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
          style: {
            fill: Colors.PINK[5],
            stroke: Colors.PINK[8],
            scale: 1.5,
          },
        },
      ],
    },
  },
  parameters: {
    controls: {
      include: ['marker'],
    },
  },
};

/**
 * 스타일 커스터마이징
 */
export const StyledMarkers: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    camera: {
      initialPosition: [-74, 40],
    },
    marker: {
      items: [
        {
          id: 'nyc',
          coordinate: [-74.006, 40.7128],
          label: 'New York',
          icon: 'circle',
          transition: {
            enabled: true,
            duration: 200000,
          },
          style: {
            fill: Colors.BLUE[6],
            stroke: 'white',
            strokeWidth: 2,
            scale: 1.2,
          },
        },
        {
          id: 'nm',
          coordinate: [-106.018, 34.519],
          label: 'New Mexico',
          icon: 'circle',
          style: {
            fill: Colors.PINK[6],
            stroke: 'white',
            strokeWidth: 2,
            scale: 0.8,
          },
        },
      ],
    },
  },
  parameters: {
    controls: {
      include: ['marker'],
    },
  },
};
