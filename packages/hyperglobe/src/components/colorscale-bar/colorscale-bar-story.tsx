import { useColorScale } from 'src/hooks/use-colorscale';
import { ColorScaleBar, type ColorScaleBarProps } from './colorscale-bar';

export function ColorScaleBarStory(props: ColorScaleBarProps) {
  // 컬러스케일 생성
  const { colorscale: _cs } = useColorScale({
    steps: [
      { to: 20, style: { fillColor: '#dbeafe' } },
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

  return <ColorScaleBar colorScale={_cs} />;
}
