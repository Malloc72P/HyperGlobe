import { useEffect, useMemo, useRef, useState } from 'react';
import { useHGM, HyperGlobe, Colors, SvgStyle, HyperglobeRef } from '../../src';
import type { RouteConfig, RoutePointConfig } from '../../src/types/hyperglobe-props';

export interface RoundTheWorld {}

const markerStyle: SvgStyle = {
  fill: Colors.BLUE[4],
  scale: 1.5,
};

// 서울 인천국제공항
const seoul: RoutePointConfig = {
  coordinate: [126.4506, 37.4639],
  label: '서울(인천국제공항)',
  style: markerStyle,
};

// 인도 뭄바이 차트라파티 시바지 마하라지 국제공항
const mumbai: RoutePointConfig = {
  coordinate: [72.8777, 19.0896],
  label: '뭄바이(차트라파티 시바지공항)',
  style: markerStyle,
};

// 남아프리카공화국 요하네스버그 O.R. 탐보 국제공항
const johannesburg: RoutePointConfig = {
  coordinate: [28.2461, -26.1367],
  label: '요하네스버그(O.R.탐보공항)',
  style: markerStyle,
};

// 영국 런던 히드로 공항
const london: RoutePointConfig = {
  coordinate: [-0.4543, 51.47],
  label: '런던(히드로공항)',
  style: markerStyle,
};

// 캐나다 토론토 피어슨 국제공항
const toronto: RoutePointConfig = {
  coordinate: [-79.6248, 43.6777],
  label: '토론토(피어슨국제공항)',
  style: markerStyle,
};

// 미국 샌프란시스코 국제공항
const sanFrancisco: RoutePointConfig = {
  coordinate: [-122.3789, 37.6213],
  label: '샌프란시스코(국제공항)',
  style: markerStyle,
};

// 남미 브라질 상파울루 구아룰류스 국제공항
const saoPaulo: RoutePointConfig = {
  coordinate: [-46.4731, -23.4356],
  label: '상파울루(구아룰류스공항)',
  style: markerStyle,
};

/**
 * 세계일주 데모
 *
 * - 서울에서 출발하여 샌프란시스코, 토론토, 런던, 상파울루, 요하네스버그, 뭄바이를 거쳐 다시 서울로 돌아오는 항공 경로를 시각화합니다.
 */
export function RoundTheWorld(routeProps: RoundTheWorld) {
  const hyperglobeRef = useRef<HyperglobeRef>(null);
  const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
  const [hgm] = useHGM({ rawHgmBlob });

  useEffect(() => {
    fetch(`/maps/nations-mid.hgm`)
      .then((res) => res.blob())
      .then((blob) => {
        setRawHgmBlob(blob);
      });
  }, []);

  const routes = useMemo<RouteConfig[]>(() => {
    // 순회 경로: 서울 → 샌프란시스코 → 토론토 → 런던 → 상파울루 → 요하네스버그 → 뭄바이 → 서울
    const routePairs: { from: RoutePointConfig; to: RoutePointConfig }[] = [
      { from: seoul, to: sanFrancisco },
      { from: sanFrancisco, to: toronto },
      { from: toronto, to: london },
      { from: london, to: saoPaulo },
      { from: saoPaulo, to: johannesburg },
      { from: johannesburg, to: mumbai },
      { from: mumbai, to: seoul },
    ];

    return routePairs.map(({ from, to }, index) => ({
      id: `${from.label}-${to.label}`,
      from,
      to,
      maxHeight: 0.1,
      lineWidth: 5,
      animationDuration: 1000,
      animationDelay: (index + 1) * 1000 + 200,
    }));
  }, []);

  return (
    <HyperGlobe
      ref={hyperglobeRef}
      hgm={hgm}
      id="hyperglobe-canvas"
      size="100%"
      maxSize={900}
      style={{ margin: '0 auto' }}
      camera={{
        initialPosition: seoul.coordinate,
      }}
      globe={{
        style: {
          color: Colors.GRAY[1],
          metalness: 0,
          roughness: 0,
        },
      }}
      graticule
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
      routes={routes}
      onReady={() => {
        const hyperglobe = hyperglobeRef.current;

        if (!hyperglobe) return;

        hyperglobe.followPath([
          { coordinate: seoul.coordinate, duration: 1000 },
          { coordinate: sanFrancisco.coordinate, duration: 1000 },
          { coordinate: toronto.coordinate, duration: 1000 },
          { coordinate: london.coordinate, duration: 1000 },
          { coordinate: saoPaulo.coordinate, duration: 1000 },
          { coordinate: johannesburg.coordinate, duration: 1000 },
          { coordinate: mumbai.coordinate, duration: 1000 },
          { coordinate: seoul.coordinate, duration: 1000 },
        ]);
      }}
    />
  );
}
