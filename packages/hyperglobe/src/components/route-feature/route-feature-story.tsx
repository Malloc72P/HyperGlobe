import { useEffect, useState } from 'react';
import { StorybookConstant } from 'src/constants';
import { Colors } from 'src/lib';
import { RouteConfig } from 'src/types';
import { useHGM } from '../../hooks/use-hgm';
import { HyperGlobe } from '../hyperglobe';

/**
 * RouteFeature 스토리 컴포넌트
 *
 * - drei의 Line을 사용한 단순한 경로 렌더링
 * - 지정된 경로(RouteFeature)를 지구본에 렌더링합니다.
 */
export function RouteStoryComponent({ routeConfig }: { routeConfig: RouteConfig[] }) {
  const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
  const [hgm] = useHGM({ rawHgmBlob });

  useEffect(() => {
    fetch(`/maps/nations-mid.hgm`)
      .then((res) => res.blob())
      .then((blob) => {
        setRawHgmBlob(blob);
      });
  }, []);

  return (
    <HyperGlobe
      {...StorybookConstant.props.HyperGlobe}
      hgm={hgm}
      // 한국과 미국 서부가 모두 보이도록 카메라 초기 위치 설정
      camera={{
        initialPosition: [183, 37],
      }}
      graticule
      routes={routeConfig}
      region={{
        style: {
          color: Colors.GRAY[7],
          fillColor: Colors.GRAY[3],
        },
        hoverStyle: {
          color: Colors.GRAY[8],
          fillColor: Colors.GRAY[3],
        },
      }}
    />
  );
}
