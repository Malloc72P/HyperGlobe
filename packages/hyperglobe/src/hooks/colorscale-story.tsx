import { useState, useEffect } from 'react';
import { ColorScaleBar, Graticule, HyperGlobe, RegionFeature } from 'src/components';
import { StorybookConstant } from 'src/constants';
import { useHGM } from './use-hgm';
import { useColorScale, type ColorScaleOptions } from './use-colorscale';
import type { RegionModel } from '@hyperglobe/interfaces';

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
export function TooltipStoryComponent(colorScaleOptions: ColorScaleOptions) {
  const [loading, setLoading] = useState(false);
  const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
  const [hgm] = useHGM({ rawHgmBlob });
  const [gdpData, setGdpData] = useState<GdpGrowth[]>([]);
  const { colorscale, resolveFeatureData } = useColorScale({
    ...colorScaleOptions,
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
