import { StorybookConstant } from 'src/constants';
import { HyperGlobe } from '../hyperglobe';
import { RegionFeature } from '../region-feature';
import { useEffect, useState } from 'react';
import { useHGM } from '../../hooks/use-hgm';
import { Colors } from 'src/lib';
import { Graticule } from '../graticule';
import { RouteFeature, RouteFeatureProps } from './route-feature';

/**
 * RouteFeature 컴포넌트
 *
 * - 지정된 경로(RouteFeature)를 지구본에 렌더링합니다.
 * - 경로는 출발지와 도착지 좌표를 기반으로 그려집니다.
 */
export function RouteStoryComponent(routeProps: RouteFeatureProps) {
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
        color: Colors.GRAY[1],
      }}
      loading={loading}
    >
      <Graticule />
      {hgm &&
        hgm.features.map((feature) => (
          <RegionFeature
            key={feature.id}
            feature={feature}
            style={{
              color: Colors.GRAY[7],
              fillColor: Colors.GRAY[2],
            }}
            hoverStyle={{
              fillColor: Colors.GRAY[3],
            }}
          />
        ))}

      <RouteFeature {...routeProps} />
    </HyperGlobe>
  );
}
