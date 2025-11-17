import { StorybookConstant } from 'src/constants';
import { HyperGlobe } from '../hyperglobe';
import { RegionFeature } from '../region-feature';
import { useEffect, useState } from 'react';
import { useHGM } from '../../hooks/use-hgm';
import type { TooltipOptions } from './tooltip';
import { Colors } from 'src/lib';
import { Graticule } from '../graticule';

/**
 * 툴팁 컴포넌트
 *
 * - 호버된 지역(RegionFeature)의 정보를 표시합니다.
 * - 툴팁은 HTML로 구현되었으며, props를 통해 tooltip 내용을 커스터마이징할 수 있습니다.
 * - 툴팁은 호버된 객체의 데이터를 참조할 수 있습니다.
 */
export function TooltipStoryComponent(tooltipProps: TooltipOptions) {
  const [loading, setLoading] = useState(false);
  const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
  const [hgm] = useHGM({ rawHgmBlob });

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
      globeStyle={{
        color: Colors.BLUE[1],
      }}
      tooltipOptions={{ ...tooltipProps }}
      loading={loading}
    >
      <Graticule />
      {hgm &&
        hgm.features.map((feature) => (
          <RegionFeature
            key={feature.id}
            feature={feature}
            hoverStyle={{
              fillColor: Colors.BLUE[4],
            }}
          />
        ))}
    </HyperGlobe>
  );
}
