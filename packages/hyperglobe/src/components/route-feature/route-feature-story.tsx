import { StorybookConstant } from 'src/constants';
import { HyperGlobe } from '../hyperglobe';
import { RegionFeature } from '../region-feature';
import { useEffect, useState } from 'react';
import { useHGM } from '../../hooks/use-hgm';
import { Colors } from 'src/lib';
import { Graticule } from '../graticule';
import { RouteFeature, RouteFeatureProps } from './route-feature';

/**
 * RouteFeature 스토리 컴포넌트
 *
 * - drei의 Line을 사용한 단순한 경로 렌더링
 * - 지정된 경로(RouteFeature)를 지구본에 렌더링합니다.
 */
export function RouteStoryComponent(routeProps: RouteFeatureProps) {
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
        color: Colors.BLUE[1],
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
              fillColor: Colors.GRAY[3],
            }}
            hoverStyle={{
              color: Colors.GRAY[8],
              fillColor: Colors.GRAY[3],
            }}
          />
        ))}

      <RouteFeature {...routeProps} />
    </HyperGlobe>
  );
}
