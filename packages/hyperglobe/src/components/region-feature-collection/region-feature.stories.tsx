import type { Meta, StoryObj } from '@storybook/react';
import { HyperGlobe } from '../hyperglobe';
import { StorybookConstant } from '../../constants';
import { Colors } from '../../lib';

/**
 * RegionFeature는 지구본 위에 국가, 행정구역 등의 지역을 렌더링하는 기능입니다.
 *
 * - HGM 파일의 피처 데이터를 3D 지구본 위에 시각화
 * - 스타일 커스터마이징 (색상, 외곽선, 투명도)
 * - 호버 시 스타일 변경
 * - 측면(Extrusion) 렌더링으로 입체감 표현
 * - 페이드 인 트랜지션 효과
 */
const meta = {
  title: 'Components/RegionFeature',
  component: HyperGlobe,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 사용법
 *
 * HyperGlobe에 hgmUrl을 전달하면 자동으로 지역이 렌더링됩니다.
 */
export const Basic: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    region: {
      style: {
        fillColor: Colors.BLUE[3],
        fillOpacity: 1,
      },
    },
  },
  parameters: {
    controls: {
      include: ['region'],
    },
  },
};

/**
 * 스타일 커스터마이징
 *
 * region.style을 통해 지역의 색상, 외곽선, 투명도를 설정할 수 있습니다.
 */
export const CustomStyle: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    region: {
      style: {
        fillColor: '#22c55e',
        fillOpacity: 0.9,
        color: '#166534',
        lineWidth: 1.5,
      },
    },
  },
  parameters: {
    controls: {
      include: ['region'],
    },
  },
};

/**
 * 호버 스타일
 *
 * region.hoverStyle을 통해 마우스를 올렸을 때의 스타일을 설정할 수 있습니다.
 */
export const HoverStyle: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    region: {
      style: {
        fillColor: Colors.BLUE[3],
        fillOpacity: 1,
        color: Colors.BLUE[7],
        lineWidth: 1,
      },
      hoverStyle: {
        fillColor: Colors.BLUE[5],
        color: Colors.BLUE[9],
        lineWidth: 2,
      },
    },
  },
  parameters: {
    controls: {
      include: ['region'],
    },
  },
};

/**
 * 측면(Extrusion) 설정
 *
 * region.extrusion을 통해 지역의 측면 색상을 설정하여 입체감을 표현할 수 있습니다.
 */
export const Extrusion: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    region: {
      style: {
        fillColor: '#f97316',
        fillOpacity: 1,
        color: '#c2410c',
        lineWidth: 1,
      },
      extrusion: {
        color: '#7c2d12',
      },
    },
  },
  parameters: {
    controls: {
      include: ['region'],
    },
  },
};

/**
 * 페이드 인 트랜지션
 *
 * region.transition을 통해 지역이 로드될 때 서서히 나타나는 효과를 적용할 수 있습니다.
 */
export const WithTransition: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    region: {
      style: {
        fillColor: Colors.BLUE[3],
        fillOpacity: 1,
        color: Colors.BLUE[7],
        lineWidth: 1,
      },
      transition: {
        enabled: true,
        duration: 1500,
        easing: 'ease-out',
      },
    },
  },
  parameters: {
    controls: {
      include: ['region'],
    },
  },
};
