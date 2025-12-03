import { useEffect, useMemo, useState } from 'react';
import { HyperGlobe, useHGM } from '../../src';

const pink = [
  '#fff1f3',
  '#ffe3e7',
  '#ffc0cb',
  '#ffa2b3',
  '#fe6e8b',
  '#f83b66',
  '#e51951',
  '#c20e43',
  '#a20f40',
  '#8a113c',
  '#4d041c',
];
const blue = [
  '#f2f6fc',
  '#e0ebf9',
  '#c9dcf4',
  '#a4c6ec',
  '#78a9e2',
  '#6794dc',
  '#4470cc',
  '#3a5dbb',
  '#354c98',
  '#2f4279',
  '#212a4a',
];

const gray = [
  '#f6f6f6',
  '#e7e7e7',
  '#d1d1d1',
  '#b0b0b0',
  '#808080',
  '#6d6d6d',
  '#5d5d5d',
  '#4f4f4f',
  '#454545',
  '#3d3d3d',
  '#262626',
];

const colorThemes = {
  pink,
  blue,
  gray,
};

export interface NationsDemo2Props {
  /**
   * 데모에 적용할 색상을 지정합니다.
   *
   * @default 'blue'
   */
  theme: 'pink' | 'blue' | 'gray';

  /**
   * 사용할 지도 데이터를 지정합니다.
   *
   * @default 'nations-high'
   */
  map: string;
}

/**
 * **국가별 세계지도 데모**
 *
 * ### 소개
 * - 새로운 Props 기반 API를 사용하여 국가별 세계지도를 렌더링합니다.
 * - hgm이 null이면 자동으로 로딩 UI가 표시됩니다.
 * - region, graticule, globe 등을 props로 설정합니다.
 *
 * ### 관련 문서
 *
 * - [HyperGlobe](/docs/components-hyperglobe--docs)
 */
export function Nations2Demo({ theme = 'blue', map = 'nations-high' }: NationsDemo2Props) {
  const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
  const [hgm] = useHGM({ rawHgmBlob });

  const color = useMemo(() => {
    return colorThemes[theme];
  }, [theme]);

  const styles = useMemo(
    () => ({
      globeColor: gray[1],
      regionStrokeWidth: 1,
      hoverRegionStrokeWidth: 2,
      regionFill: color[3],
      hoverRegionFill: color[4],
      regionColor: color[7],
      regionExtrusionColor: color[8],
      metalness: 0,
      roughness: 0,
    }),
    [color]
  );

  useEffect(() => {
    const mapName = map.split('(')[0];

    fetch(`/maps/${mapName}.hgm`)
      .then((res) => res.blob())
      .then((blob) => {
        setRawHgmBlob(blob);
      });
  }, [map]);

  return (
    <div>
      <HyperGlobe
        hgm={hgm}
        maxSize={900}
        globe={{
          style: {
            color: styles.globeColor,
            metalness: styles.metalness,
            roughness: styles.roughness,
          },
        }}
        graticule
        region={{
          style: {
            lineWidth: styles.regionStrokeWidth,
            color: styles.regionColor,
            fillColor: styles.regionFill,
          },
          hoverStyle: {
            lineWidth: styles.hoverRegionStrokeWidth,
            fillColor: styles.hoverRegionFill,
          },
          extrusion: {
            color: styles.regionExtrusionColor,
          },
        }}
        onReady={() => {
          console.log('HyperGlobe 렌더링 완료');
        }}
      />
    </div>
  );
}
