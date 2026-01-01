import { useEffect, useMemo, useState } from 'react';
import { HyperGlobe } from '../../src';

interface ColorScaleBarDemoProps {
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
export function ColorScaleBarDemo({ theme = 'blue' }: ColorScaleBarDemoProps) {
  const [gdpData, setGdpData] = useState<any[]>([]);

  // 테마별 색상 설정 (더 옅은 톤)
  const colorSteps = {
    blue: [
      { to: -10, color: '#f0f9ff' },
      { from: -10, to: 0, color: '#dbeafe' },
      { from: 0, to: 2, color: '#bfdbfe' },
      { from: 2, to: 4, color: '#93c5fd' },
      { from: 4, to: 6, color: '#60a5fa' },
      { from: 6, color: '#3b82f6' },
    ],
    red: [
      { to: -10, color: '#fef2f2' },
      { from: -10, to: 0, color: '#fee2e2' },
      { from: 0, to: 2, color: '#fecaca' },
      { from: 2, to: 4, color: '#fca5a5' },
      { from: 4, to: 6, color: '#f87171' },
      { from: 6, color: '#ef4444' },
    ],
    green: [
      { to: -10, color: '#f0fdf4' },
      { from: -10, to: 0, color: '#dcfce7' },
      { from: 0, to: 2, color: '#bbf7d0' },
      { from: 2, to: 4, color: '#86efac' },
      { from: 4, to: 6, color: '#4ade80' },
      { from: 6, color: '#22c55e' },
    ],
  };

  // 포맷 함수 선택
  const formatters = {
    default: (value: number) => value.toFixed(0),
    locale: (value: number) => value.toLocaleString(),
    fixed: (value: number) => `${value.toFixed(2)}%`,
  };

  useEffect(() => {
    fetch('/data/gdp-growth.json')
      .then((res) => res.json())
      .then(setGdpData);
  }, []);

  return (
    <div>
      <HyperGlobe
        id="colorscale-demo-globe"
        hgmUrl="https://unpkg.com/@malloc72p/hyperglobe-maps/dist/nations-mid.hgm"
        size="100%"
        maxSize={900}
        style={{ margin: '0 auto' }}
        graticule
        globe={{
          style: {
            color: '#f6f6f6',
            metalness: 0,
            roughness: 0,
          },
        }}
        dataMap={{
          gdpGrowth: gdpData,
        }}
        region={{
          dataKey: 'gdpGrowth',
          idField: 'isoA2',
          dataIdField: 'key',
        }}
        colorscale={{
          steps: colorSteps[theme],
          nullColor: '#e5e7eb',
          colorscaleBar: {
            position: 'bottom-right',
          },
        }}
        tooltip={{
          distance: 12,
          text: (region) => {
            const value = region.data?.value;
            return `${region.name}(${value == null ? 'No Data' : value?.toFixed(2) + '%'})`;
          },
        }}
      />
    </div>
  );
}
