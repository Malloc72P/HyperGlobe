import { useEffect, useMemo, useState } from 'react';
import { HyperGlobe, useColorScale, useHGM } from '../../src';

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
export function ColorScaleBarDemo({
  formatType = 'fixed',
  theme = 'blue',
}: ColorScaleBarDemoProps) {
  const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
  const [hgm] = useHGM({ rawHgmBlob });
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

  const { colorscale } = useColorScale({
    steps: colorSteps[theme],
    nullColor: '#e5e7eb',
    data: gdpData,
    itemResolver: (feature, item) => feature.properties.isoA2 === item.id,
  });

  // 포맷 함수 선택
  const formatters = {
    default: (value: number) => value.toFixed(0),
    locale: (value: number) => value.toLocaleString(),
    fixed: (value: number) => `${value.toFixed(2)}%`,
  };

  // dataMap 형식으로 변환 (Record<string, number>)
  const dataMap = useMemo(() => {
    if (!gdpData.length) return undefined;

    const gdpGrowth: Record<string, { value: number }> = {};
    for (const item of gdpData) {
      gdpGrowth[item.id] = { value: item.value };
    }

    return { gdpGrowth };
  }, [gdpData]);

  useEffect(() => {
    (async function () {
      const [hgmBlob, gdpGrowth] = await Promise.all([
        fetch('/maps/nations-mid.hgm').then((res) => res.blob()),
        fetch('/data/gdp-growth.json').then((res) => res.json()),
      ]);

      setRawHgmBlob(hgmBlob);
      setGdpData(gdpGrowth);
    })();
  }, []);

  return (
    <div>
      <HyperGlobe
        hgm={hgm}
        id="colorscale-demo-globe"
        size="100%"
        maxSize={900}
        style={{ margin: '0 auto' }}
        globe={{
          style: {
            color: '#f6f6f6',
            metalness: 0,
            roughness: 0,
          },
        }}
        dataMap={dataMap}
        region={{
          dataKey: 'gdpGrowth',
          idField: 'isoA2',
        }}
        colorscale={{
          model: colorscale,
          dataKey: 'gdpGrowth',
        }}
        colorscaleBar={{
          position: 'bottom-right',
          formatLabel: formatters[formatType],
        }}
        tooltip={{
          distance: 12,
          text: (region) => {
            const value = region.data?.value;
            return `${region.name}(${value == null ? 'No Data' : value?.toFixed(2) + '%'})`;
          },
        }}
        graticule
        onReady={() => {
          console.log('ColorScaleBar 데모 렌더링 완료');
        }}
      />
    </div>
  );
}
