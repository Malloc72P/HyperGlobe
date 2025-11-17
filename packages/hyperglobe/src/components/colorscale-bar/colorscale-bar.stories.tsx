import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorScaleBar, type ColorScaleBarProps } from './colorscale-bar';
import { useColorScale } from '../../hooks/use-colorscale';
import { defaultExample } from './colorscale-bar.code-snippets';
import { ColorScaleBarStory } from './colorscale-bar-story';

const meta = {
  title: 'Components/ColorScaleBar',
  component: ColorScaleBarStory,
  tags: ['autodocs'],
} satisfies Meta<typeof ColorScaleBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 컬러스케일 바 컴포넌트.
 *
 * - ColorScaleBar 컴포넌트는 useColorScale 훅으로 생성한 컬러스케일 모델을 시각적으로 표시하는 막대 컴포넌트입니다.
 * - 이 스토리는 ColorScaleBar 컴포넌트의 기본 사용법을 보여줍니다.
 */
export const Default: Story = {
  name: '기본',
  args: {
    colorScale: null,
  },
  argTypes: {
    colorScale: {
      control: false,
    },
  },
  parameters: {
    docs: {
      source: {
        code: defaultExample,
      },
    },
  },
};
