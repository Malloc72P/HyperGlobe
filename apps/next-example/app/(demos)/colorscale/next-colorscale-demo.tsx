import {
  ColorScaleBar,
  Graticule,
  HyperGlobe,
  RegionFeature,
  RegionModel,
  useColorScale,
  useHGM,
  Colors,
} from '@hyperglobe/core';
import { useEffect, useState } from 'react';

interface GdpGrowth {
  id: string;
  data: { year: number; value: number }[];
}

export function ColorScaleDemo() {
  const [loading, setLoading] = useState(false);
  const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
  const [hgm] = useHGM({ rawHgmBlob });
  const [gdpData, setGdpData] = useState<GdpGrowth[]>([]);
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
        loading={loading}
        globeStyle={{
          color: Colors.GRAY[0],
        }}
        tooltipOptions={{
          distance: 12,
          text: (region: RegionModel<{ value: number }>) => {
            const value = region.data?.value;

            return `${region.name}(${!value ? 'No Data' : value?.toFixed(2) + '%'})`;
          },
        }}
      >
        {hgm &&
          hgm.features.map((feature: any) => (
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
