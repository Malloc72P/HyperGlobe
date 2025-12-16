import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColorScaleBarDemo } from './colorscale-bar-demo';

export const DUMMY = true;

const meta = {
  title: 'Demo/ColorScaleBar',
  component: ColorScaleBarDemo,
} satisfies Meta<typeof ColorScaleBarDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  name: 'ColorScaleBar 데모',
  tags: ['autodocs'],
  args: {
    formatType: 'fixed',
    theme: 'blue',
  },
  argTypes: {
    formatType: {
      control: 'select',
      options: ['default', 'locale', 'fixed'],
      description: '레이블 포맷 방식',
    },
    theme: {
      control: 'select',
      options: ['blue', 'red', 'green'],
      description: '컬러 테마',
    },
  },
  parameters: {
    docs: {
      source: {
        code: `import { useEffect, useState } from 'react';
            import {
              ColorScaleBar,
              Graticule,
              HyperGlobe,
              RegionFeature,
              useColorScale,
              useHGM,
            } from '../../src';
            
            interface ColorScaleBarDemoProps {
              /**
               * 포맷 함수 타입
               */
              formatType: 'default' | 'locale' | 'fixed';
              /**
               * 컬러 테마
               */
              theme: 'blue' | 'red' | 'green';
            }
            
            /**
             * **ColorScaleBar 데모**
             *
             * ColorScaleBar 컴포넌트를 실제 지도와 함께 사용하는 데모입니다.
             * 지역을 호버하면 해당 값의 위치에 마커가 표시됩니다.
             */
            export function ColorScaleBarDemo({ formatType = 'fixed', theme = 'blue' }: ColorScaleBarDemoProps) {
              const [loading, setLoading] = useState(false);
              const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
              const [hgm] = useHGM({ rawHgmBlob });
              const [gdpData, setGdpData] = useState<any[]>([]);
            
              // 테마별 색상 설정 (더 옅은 톤)
              const colorSteps = {
                blue: [
                  { to: -10, style: { fillColor: '#f0f9ff' } },
                  { from: -10, to: 0, style: { fillColor: '#dbeafe' } },
                  { from: 0, to: 2, style: { fillColor: '#bfdbfe' } },
                  { from: 2, to: 4, style: { fillColor: '#93c5fd' } },
                  { from: 4, to: 6, style: { fillColor: '#60a5fa' } },
                  { from: 6, style: { fillColor: '#3b82f6' } },
                ],
                red: [
                  { to: -10, style: { fillColor: '#fef2f2' } },
                  { from: -10, to: 0, style: { fillColor: '#fee2e2' } },
                  { from: 0, to: 2, style: { fillColor: '#fecaca' } },
                  { from: 2, to: 4, style: { fillColor: '#fca5a5' } },
                  { from: 4, to: 6, style: { fillColor: '#f87171' } },
                  { from: 6, style: { fillColor: '#ef4444' } },
                ],
                green: [
                  { to: -10, style: { fillColor: '#f0fdf4' } },
                  { from: -10, to: 0, style: { fillColor: '#dcfce7' } },
                  { from: 0, to: 2, style: { fillColor: '#bbf7d0' } },
                  { from: 2, to: 4, style: { fillColor: '#86efac' } },
                  { from: 4, to: 6, style: { fillColor: '#4ade80' } },
                  { from: 6, style: { fillColor: '#22c55e' } },
                ],
              };
            
              const { colorscale, resolveFeatureData } = useColorScale({
                steps: colorSteps[theme],
                nullStyle: {
                  fillColor: '#e5e7eb',
                },
                data: gdpData,
                itemResolver: (feature, item) => feature.properties.isoA2 === item.id,
              });
            
              // 포맷 함수 선택
              const formatters = {
                default: (value: number) => value.toFixed(0),
                locale: (value: number) => value.toLocaleString(),
                fixed: (value: number) => \`\${value.toFixed(2)}%\`,
              };
            
              useEffect(() => {
                setLoading(true);
            
                (async function () {
                  const [hgmBlob, gdpGrowth] = await Promise.all([
                    fetch('/maps/nations-mid.hgm').then((res) => res.blob()),
                    fetch('/data/gdp-growth.json').then((res) => res.json()),
                  ]);
            
                  setRawHgmBlob(hgmBlob);
                  setGdpData(gdpGrowth);
            
                  setTimeout(() => setLoading(false), 300);
                })();
              }, []);
            
              return (
                <div>
                  <HyperGlobe
                    id="colorscale-demo-globe"
                    size="100%"
                    maxSize={900}
                    style={{ margin: '0 auto' }}
                    loading={loading}
                    globeStyle={{
                      color: '#f6f6f6',
                      metalness: 0,
                      roughness: 0,
                    }}
                    tooltipOptions={{
                      distance: 12,
                      text: (region: any) => {
                        const value = region.data?.value;
                        return \`\${region.name}(\${!value ? 'No Data' : value?.toFixed(2) + '%'})\`;
                      },
                    }}
                  >
                    {hgm &&
                      hgm.features.map((feature) => (
                        <RegionFeature
                          key={feature.id}
                          feature={feature}
                          colorscale={colorscale}
                          data={resolveFeatureData(feature)}
                        />
                      ))}
                    <Graticule />
                  </HyperGlobe>
            
                  <ColorScaleBar
                    colorScale={colorscale}
                    formatLabel={formatters[formatType]}
                    style={{
                      paddingTop: 10,
                      maxWidth: '70%',
                      margin: '0 auto',
                      fontSize: 12,
                    }}
                  />
                </div>
              );
            }
            `,
      },
    },
  },
};
