import { useState, useEffect } from 'react';
import {
  useHGM,
  HyperGlobe,
  Colors,
  Graticule,
  RegionFeature,
  RouteFeature,
  MarkerFeature,
} from '../../src';
import { StorybookConstant } from '../../src/constants';

export interface AirlineStoryProps {}

/**
 *
 */
export function AirlineStory(routeProps: AirlineStoryProps) {
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
      // 한국과 미국 서부가 모두 보이도록 카메라 초기 위치 설정
      initialCameraPosition={[183, 37]}
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
              color: Colors.GRAY[8],
              fillColor: Colors.GRAY[3],
            }}
          />
        ))}

      <MarkerFeature
        markers={[
          {
            position: [127, 37],
            label: '대한민국(서울인천공항)',
          },
          {
            position: [-118.4085, 33.9416],
            label: '미국(로스앤젤레스국제공항)',
          },
        ]}
      />
      <RouteFeature
        from={[127, 37]}
        to={[-118.4085, 33.9416]}
        maxHeight={0.1}
        lineWidth={5}
        animationDuration={0.8}
      />
    </HyperGlobe>
  );
}
