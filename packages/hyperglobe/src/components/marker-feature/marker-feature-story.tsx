import { StorybookConstant } from 'src/constants';
import { Colors } from 'src/lib';
import { MarkersConfig } from 'src/types';
import { HyperGlobe } from '../hyperglobe';

/**
 * MarkerFeature 스토리 컴포넌트
 *
 * - Html 컴포넌트를 사용한 마커와 라벨 렌더링
 * - 지정된 마커들을 지구본에 렌더링합니다.
 */
export function MarkerStoryComponent(markerConfig: MarkersConfig) {
  return (
    <HyperGlobe
      {...StorybookConstant.props.HyperGlobe}
      globe={{
        style: {
          color: Colors.GRAY[1],
        },
      }}
      camera={{
        initialPosition: [127, 36],
      }}
      graticule
      markers={markerConfig}
      region={{
        style: {
          color: Colors.GRAY[7],
          fillColor: Colors.GRAY[2],
        },
        hoverStyle: {
          color: Colors.GRAY[8],
          fillColor: Colors.GRAY[3],
        },
      }}
    />
  );
}
