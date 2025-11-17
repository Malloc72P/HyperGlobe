import { useEffect, useMemo, useState } from 'react';
import { Graticule, HyperGlobe, RegionFeature, useHGM } from '@hyperglobe/core';

const blue = [
  '#f2f6fc',
  '#e0ebf9',
  '#c9dcf4',
  '#a4c6ec',
  '#78a9e2',
  '#6794dc',
  '#4470cc',
  '#3a5dbb',
  '#354c98',
  '#2f4279',
  '#212a4a',
];

export function NextHyperGlobeDemo() {
  const [loading, setLoading] = useState(false);
  const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
  const [hgm] = useHGM({ rawHgmBlob });

  const styles = useMemo(
    () => ({
      globeColor: blue[0],
      regionStrokeWidth: 1.3,
      hoverRegionStrokeWidth: 2,
      regionFill: blue[4],
      hoverRegionFill: blue[5],
      regionColor: blue[7],
      metalness: 0,
      roughness: 0.5,
    }),
    []
  );

  useEffect(() => {
    setLoading(true);

    fetch(`/maps/nations-high.hgm`)
      .then((res) => res.blob())
      .then((blob) => {
        setRawHgmBlob(blob);
        setTimeout(() => setLoading(false), 300);
      });
  }, []);

  return (
    <HyperGlobe
      loading={loading}
      globeStyle={{
        color: styles.globeColor,
        metalness: styles.metalness,
        roughness: styles.roughness,
      }}
      tooltipOptions={{}}
    >
      <Graticule />
      {hgm &&
        hgm.features.map((feature: any) => (
          <RegionFeature
            key={feature.id}
            feature={feature}
            style={{
              lineWidth: styles.regionStrokeWidth,
              color: styles.regionColor,
              fillColor: styles.regionFill,
            }}
            hoverStyle={{
              lineWidth: styles.hoverRegionStrokeWidth,
              fillColor: styles.hoverRegionFill,
            }}
          />
        ))}
    </HyperGlobe>
  );
}
