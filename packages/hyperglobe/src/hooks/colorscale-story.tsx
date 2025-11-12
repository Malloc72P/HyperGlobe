import { useState, useEffect } from 'react';
import { HyperGlobe, RegionFeature } from 'src/components';
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
  const { colorscale, getStyle, getHoverStyle } = useColorScale(colorScaleOptions);

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
    <HyperGlobe
      {...StorybookConstant.props.HyperGlobe}
      loading={loading}
      tooltipOptions={{
        text: (region: RegionModel<{ value: number }>) => `${region.name}(${region.data?.value})`,
      }}
    >
      {hgm &&
        hgm.features.map((feature, index) => (
          <RegionFeature
            key={feature.id}
            feature={feature}
            data={{
              value: (index + 1) * 10,
            }}
          />
        ))}
    </HyperGlobe>
  );
}
