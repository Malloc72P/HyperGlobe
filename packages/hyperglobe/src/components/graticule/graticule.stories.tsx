import type { Meta, StoryObj } from '@storybook/react';
import { HyperGlobe } from '../hyperglobe';
import { StorybookConstant } from '../../constants';

/**
 * Graticule은 지구본 위에 경위선 격자를 표시하는 컴포넌트입니다.
 *
 * - 경선과 위선 간격 조절 가능
 * - 격자선 색상과 두께 커스터마이징
 * - HyperGlobe의 graticule prop으로 설정
 */
const meta = {
  title: 'Components/Graticule',
  component: HyperGlobe,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 경위선 격자
 */
export const Basic: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    graticule: true,
  },
  parameters: {
    controls: {
      include: ['graticule'],
    },
  },
};

/**
 * 격자 간격 조절
 */
export const CustomStep: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    graticule: {
      longitudeStep: 30,
      latitudeStep: 30,
    },
  },
  parameters: {
    controls: {
      include: ['graticule'],
    },
  },
};

/**
 * 격자선 스타일 커스터마이징
 */
export const StyledGraticule: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    graticule: {
      longitudeStep: 15,
      latitudeStep: 15,
      lineColor: '#4470cc',
      lineWidth: 2,
    },
  },
  parameters: {
    controls: {
      include: ['graticule'],
    },
  },
};
