import { useState, useEffect } from 'react';
import { ColorScaleBar, Graticule, HyperGlobe, RegionFeatureCollection } from 'src/components';
import { StorybookConstant } from 'src/constants';
import { useHGM } from './use-hgm';
import { useColorScale, type ColorScaleOptions } from './use-colorscale';
import type { RegionModel } from '@hyperglobe/interfaces';
import { Colors } from 'src/lib/colors';

interface GdpGrowth {
  id: string;
  data: { year: number; value: number }[];
}

/**
 * 컬러스케일
 *
 * - 컬러스케일은 지도 데이터의 값에 따라 스타일을 다르게 적용할 수 있는 기능입니다.
 * - 이 예제에서는 useColorScale 훅을 사용하여 컬러스케일을 적용하는 방법을 보여줍니다.
 */
export function ColorScaleStoryComponent(colorScaleOptions: ColorScaleOptions) {
  const [loading, setLoading] = useState(false);
  const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
  const [hgm] = useHGM({ rawHgmBlob });
  const [gdpData, setGdpData] = useState<any[]>([]);
  const { colorscale, resolveFeatureData } = useColorScale({
    steps: [
      { to: -10, style: { fillColor: '#ff5757' } },
      { from: -10, to: 0, style: { fillColor: '#ffc0c0' } },
      { from: 0, to: 1, style: { fillColor: '#f2f6fc' } },
      { from: 1, to: 3, style: { fillColor: '#c9dcf4' } },
      { from: 3, to: 5, style: { fillColor: '#a4c6ec' } },
      { from: 5, style: { fillColor: '#78a9e2' } },
    ],
    nullStyle: {
      fillColor: Colors.GRAY[3],
    },
    data: gdpData,
    itemResolver: (feature, item) => feature.properties.isoA2 === item.id,
  });

  useEffect(() => {
    setLoading(true);

    (async function () {
      const [hgmBlob, gdpGrowth] = await Promise.all([
        await fetch('/maps/nations-mid.hgm').then((res) => res.blob()),
        await fetch('/data/gdp-growth.json').then((res) => res.json() as Promise<GdpGrowth[]>),
      ]);

      setRawHgmBlob(hgmBlob);
      setGdpData(gdpGrowth);

      setTimeout(() => setLoading(false), 300);
    })();
  }, []);

  return (
    <div>
      <HyperGlobe
        {...StorybookConstant.props.HyperGlobe}
        loading={loading}
        tooltipOptions={{
          distance: 12,
          text: (region: RegionModel<{ value: number }>) => {
            const value = region.data?.value;

            return `${region.name}(${!value ? 'No Data' : value?.toFixed(2) + '%'})`;
          },
        }}
      >
        {hgm && (
          <RegionFeatureCollection
            features={hgm.features}
            colorscale={colorscale}
            data={gdpData.reduce((acc, item) => {
              acc[item.id] = { value: item.value };
              return acc;
            }, {})}
            idField="isoA2"
            valueField="value"
          />
        )}
        <Graticule />
      </HyperGlobe>

      {/* <ColorScaleBar
        colorScale={colorscale}
        style={{
          paddingTop: 10,
          maxWidth: '70%',
          margin: '0 auto',
          fontSize: 12,
        }}
      /> */}
    </div>
  );
}
