import { useState, useEffect } from 'react';
import { ColorScaleBar, Graticule, HyperGlobe, RegionFeature } from 'src/components';
import { StorybookConstant } from 'src/constants';
import { useHGM } from './use-hgm';
import { useColorScale, type ColorScaleOptions } from './use-colorscale';
import type { RegionModel } from '@hyperglobe/interfaces';

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
  const { colorscale } = useColorScale(colorScaleOptions);

  useEffect(() => {
    setLoading(true);

    fetch(`/maps/nations-mid.hgm`)
      .then((res) => res.blob())
      .then((blob) => {
        setRawHgmBlob(blob);
        setTimeout(() => setLoading(false), 300);
      });
  }, []);

  return (
    <div>
      <HyperGlobe
        {...StorybookConstant.props.HyperGlobe}
        loading={loading}
        tooltipOptions={{
          distance: 12,
          text: (region: RegionModel<{ value: number }>) => `${region.name}(${region.data?.value})`,
        }}
      >
        {hgm &&
          hgm.features.map((feature, index) => (
            <RegionFeature
              key={feature.id}
              feature={feature}
              colorscale={colorscale}
              data={{
                value: (index + 1) * 10,
              }}
            />
          ))}
        <Graticule />
      </HyperGlobe>

      <ColorScaleBar
        colorScale={colorscale}
        style={{
          maxWidth: '70%',
          margin: '0 auto',
        }}
      />
    </div>
  );
}
