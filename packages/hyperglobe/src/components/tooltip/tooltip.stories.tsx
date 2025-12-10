import type { Meta, StoryObj } from '@storybook/react';
import { HyperGlobe } from '../hyperglobe';
import { StorybookConstant } from '../../constants';

/**
 * Tooltip은 지구본 위에서 호버된 지역의 정보를 표시하는 컴포넌트입니다.
 *
 * - 호버된 지역의 ID와 이름을 표시
 * - 스타일 커스터마이징 가능
 * - 커스텀 텍스트 함수 지원
 */
const meta = {
  title: 'Components/Tooltip',
  component: HyperGlobe,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 툴팁
 */
export const Basic: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    tooltip: true,
  },
  parameters: {
    controls: {
      include: ['tooltip'],
    },
  },
};

/**
 * 스타일 커스터마이징
 */
export const StyledTooltip: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    tooltip: {
      style: {
        background: '#2b2b2b',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px',
      },
    },
  },
  parameters: {
    controls: {
      include: ['tooltip'],
    },
  },
};

/**
 * 커스텀 텍스트
 */
export const CustomText: Story = {
  args: {
    ...StorybookConstant.props.HyperGlobe,
    tooltip: {
      text: (region) => {
        const { continent, isoA2, isoA3 } = region.properties;
        return `${region.name} (${continent}) [${isoA2}, ${isoA3}]`;
      },
      style: {
        background: '#1a1a2e',
        color: 'white',
        padding: '6px 10px',
        fontSize: '10px',
      },
    },
  },
  parameters: {
    controls: {
      include: ['tooltip'],
    },
  },
};
