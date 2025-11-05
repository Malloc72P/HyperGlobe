import { useMemo, useState } from 'react';
import { HyperGlobe, Graticule, RegionFeature } from '../src';
import GeoJson from '../src/data/world-high.geo.json';

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

export interface NationsDemoProps {
  /**
   * 데모에 적용할 색상을 지정합니다.
   *
   * @default 'blue'
   */
  theme?: 'pink' | 'blue' | 'gray';
}

/**
 * **국가별 세계지도 데모**
 *
 * ### 소개
 * - HyperGlobe 컴포넌트와 Graticule, RegionFeature 컴포넌트를 사용하여 국가별 세계지도를 렌더링합니다.
 * - HyperGlobe의 textureEnabled 속성을 false로 설정하여 지구본의 텍스처를 비활성화합니다.
 * - 대신 globeStyle속성을 사용하여 지구본의 색상과 재질 속성을 지정합니다.
 * - Graticule 컴포넌트로 지구본의 격자선을 추가합니다.
 * - RegionFeature 컴포넌트를 사용하여 GeoJSON 데이터의 각 국가를 렌더링합니다.
 *
 * ### 관련 문서
 *
 * - [HyperGlobe](/docs/components-hyperglobe--docs)
 * - [RegionFeature](/docs/components-regionfeature--docs)
 * - [Graticule](/docs/components-graticule--docs)
 */
export function NationsDemo({ theme = 'blue' }: NationsDemoProps) {
  const color = useMemo(() => {
    return colorThemes[theme];
  }, [theme]);

  const styles = useMemo(
    () => ({
      globeColor: gray[0],
      regionStrokeWidth: 1.3,
      hoverRegionStrokeWidth: 2,
      regionFill: color[4],
      hoverRegionFill: color[5],
      regionColor: color[7],
      metalness: 0,
      roughness: 0.5,
    }),
    [theme]
  );

  return (
    <HyperGlobe
      maxSize={900}
      globeStyle={{
        color: styles.globeColor,
        metalness: styles.metalness,
        roughness: styles.roughness,
      }}
    >
      <Graticule />
      {GeoJson.features.map((feature) => (
        <RegionFeature
          key={feature.id}
          feature={feature}
          style={{
            lineWidth: styles.regionStrokeWidth,
            color: styles.regionColor,
            fillColor: styles.regionFill,
          }}
          hoverStyle={{
            lineWidth: styles.hoverRegionStrokeWidth,
            fillColor: styles.hoverRegionFill,
          }}
          metalness={styles.metalness}
          roughness={styles.roughness}
        />
      ))}
    </HyperGlobe>
  );
}
