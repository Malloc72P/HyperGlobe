import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorScaleBar, type ColorScaleBarProps } from './colorscale-bar';
import { useColorScale } from '../../hooks/use-colorscale';

/**
 * ColorScaleBar 컴포넌트 래퍼
 *
 * useColorScale로 생성한 컬러스케일 모델을 시각적으로 표시하는 범례 UI입니다.
 */
function ColorScaleBarComponent({ formatLabel, style }: Omit<ColorScaleBarProps, 'colorScale'>) {
  // 컬러스케일 생성
  const { colorscale } = useColorScale({
    steps: [
      { to: 0, style: { fillColor: '#f0f9ff' } },
      { from: 0, to: 20, style: { fillColor: '#dbeafe' } },
      { from: 20, to: 40, style: { fillColor: '#bfdbfe' } },
      { from: 40, to: 60, style: { fillColor: '#93c5fd' } },
      { from: 60, to: 80, style: { fillColor: '#60a5fa' } },
      { from: 80, style: { fillColor: '#3b82f6' } },
    ],
    data: [
      { id: '1', value: 10 },
      { id: '2', value: 50 },
      { id: '3', value: 90 },
    ],
  });

  return <ColorScaleBar colorScale={colorscale} formatLabel={formatLabel} style={style} />;
}

const meta = {
  title: 'Components/ColorScaleBar',
  component: ColorScaleBarComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof ColorScaleBarComponent>;

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
  args: {},
  parameters: {
    docs: {
      source: {
        code: `
// useColorScale 훅으로 컬러스케일 객체 생성
const { colorscale } = useColorScale({
    steps: [
        { to: 0, style: { fillColor: '#f0f9ff' } },
        { from: 0, to: 20, style: { fillColor: '#dbeafe' } },
        { from: 20, to: 40, style: { fillColor: '#bfdbfe' } },
        { from: 40, to: 60, style: { fillColor: '#93c5fd' } },
        { from: 60, to: 80, style: { fillColor: '#60a5fa' } },
        { from: 80, style: { fillColor: '#3b82f6' } },
    ],
    data: [
        { id: '1', value: 10 },
        { id: '2', value: 50 },
        { id: '3', value: 90 },
    ],
});

// props로 컬러스케일 객체 전달.
return <ColorScaleBar colorScale={colorscale}/>;
            `,
      },
    },
  },
};
