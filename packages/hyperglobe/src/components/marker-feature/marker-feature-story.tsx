import { useEffect, useState } from 'react';
import { StorybookConstant } from 'src/constants';
import { Colors } from 'src/lib';
import { useHGM } from '../../hooks/use-hgm';
import { Graticule } from '../graticule';
import { HyperGlobe } from '../hyperglobe';
import { RegionFeatureCollection } from '../region-feature-collection';
import { MarkerFeature, MarkerFeatureProps } from './marker-feature';

/**
 * MarkerFeature 스토리 컴포넌트
 *
 * - Html 컴포넌트를 사용한 마커와 라벨 렌더링
 * - 지정된 마커들을 지구본에 렌더링합니다.
 */
export function MarkerStoryComponent(markerProps: MarkerFeatureProps) {
  const [loading, setLoading] = useState(true);
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
      initialCameraPosition={[127, 36]}
      loading={loading}
    >
      <Graticule />
      {hgm && (
        <RegionFeatureCollection
          features={hgm.features}
          style={{
            color: Colors.GRAY[7],
            fillColor: Colors.GRAY[2],
          }}
          hoverStyle={{
            color: Colors.GRAY[8],
            fillColor: Colors.GRAY[3],
          }}
        />
      )}

      <MarkerFeature {...markerProps} />
    </HyperGlobe>
  );
}
