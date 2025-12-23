import { useState, useEffect, useMemo } from 'react';
import { HyperGlobe } from 'src/components';
import { StorybookConstant } from 'src/constants';
import { useColorScale, type ColorScaleOptions } from './use-colorscale';
import type { RegionModel } from '@hyperglobe/interfaces';
import { Colors } from 'src/lib/colors';

interface GdpGrowth {
  id: string;
  data: { year: number; value: number }[];
}

/**
 * 컬러스케일
 *
 * - 컬러스케일은 지도 데이터의 값에 따라 스타일을 다르게 적용할 수 있는 기능입니다.
 * - 이 예제에서는 useColorScale 훅을 사용하여 컬러스케일을 적용하는 방법을 보여줍니다.
 */
export function ColorScaleStoryComponent() {
  const [gdpData, setGdpData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/gdp-growth.json')
      .then((res) => res.json() as Promise<GdpGrowth[]>)
      .then(setGdpData);
  }, []);

  return (
    <div>
      <HyperGlobe
        {...StorybookConstant.props.HyperGlobe}
        dataMap={{
          gdpGrowth: gdpData,
        }}
        region={{
          dataKey: 'gdpGrowth',
          idField: 'isoA2', // region feature의 id 매핑용 필드
          dataIdField: 'id', // data 항목의 id 필드
        }}
        colorscale={{
          dataKey: 'gdpGrowth',
          steps: [
            { to: -10, color: '#ff5757' },
            { from: -10, to: 0, color: '#ffc0c0' },
            { from: 0, to: 1, color: '#f2f6fc' },
            { from: 1, to: 3, color: '#c9dcf4' },
            { from: 3, to: 5, color: '#a4c6ec' },
            { from: 5, color: '#78a9e2' },
          ],
          nullColor: Colors.GRAY[3],
        }}
        tooltip={{
          distance: 12,
          text: (region: RegionModel<{ value: number }>) => {
            const value = region.data?.value;
            return `${region.name}(${!value ? 'No Data' : value?.toFixed(2) + '%'})`;
          },
        }}
        graticule
      />
    </div>
  );
}
