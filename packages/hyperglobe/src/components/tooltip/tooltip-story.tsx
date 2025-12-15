import { StorybookConstant } from 'src/constants';
import { HyperGlobe } from '../hyperglobe';
import type { TooltipConfig } from '../../types/hyperglobe-props';
import { Colors } from 'src/lib';

/**
 * 툴팁 컴포넌트
 *
 * - 호버된 지역(RegionFeature)의 정보를 표시합니다.
 * - 툴팁은 HTML로 구현되었으며, props를 통해 tooltip 내용을 커스터마이징할 수 있습니다.
 * - 툴팁은 호버된 객체의 데이터를 참조할 수 있습니다.
 */
export function TooltipStoryComponent(tooltipProps: TooltipConfig) {
  return (
    <HyperGlobe
      {...StorybookConstant.props.HyperGlobe}
      tooltip={tooltipProps}
      globe={{
        style: {
          color: 'black',
        },
      }}
      graticule
      region={{
        style: {
          color: Colors.GRAY[2],
          fillColor: Colors.GRAY[7],
        },
        hoverStyle: {
          fillColor: Colors.GRAY[6],
        },
      }}
    />
  );
}
