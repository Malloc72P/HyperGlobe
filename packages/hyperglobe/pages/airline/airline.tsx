import { useState, useEffect, useMemo } from 'react';
import {
  useHGM,
  HyperGlobe,
  Colors,
  Graticule,
  RegionFeature,
  RouteFeature,
  MarkerFeature,
  RouteFeatureProps,
  RoutePoint,
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

  const routes = useMemo<Pick<RouteFeatureProps, 'from' | 'to'>[]>(() => {
    // 서울 인천국제공항
    const seoul: RoutePoint = {
      coordinate: [126.4506, 37.4639],
      label: '서울(인천국제공항)',
    };

    // 인도 뭄바이 차트라파티 시바지 마하라지 국제공항
    const mumbai: RoutePoint = {
      coordinate: [72.8777, 19.0896],
      label: '뭄바이(차트라파티 시바지공항)',
    };

    // 남아프리카공화국 요하네스버그 O.R. 탐보 국제공항
    const johannesburg: RoutePoint = {
      coordinate: [28.2461, -26.1367],
      label: '요하네스버그(O.R.탐보공항)',
    };

    // 영국 런던 히드로 공항
    const london: RoutePoint = {
      coordinate: [-0.4543, 51.47],
      label: '런던(히드로공항)',
    };

    // 캐나다 토론토 피어슨 국제공항
    const toronto: RoutePoint = {
      coordinate: [-79.6248, 43.6777],
      label: '토론토(피어슨국제공항)',
    };

    // 미국 샌프란시스코 국제공항
    const sanFrancisco: RoutePoint = {
      coordinate: [-122.3789, 37.6213],
      label: '샌프란시스코(국제공항)',
    };

    // 남미 브라질 상파울루 구아룰류스 국제공항
    const saoPaulo: RoutePoint = {
      coordinate: [-46.4731, -23.4356],
      label: '상파울루(구아룰류스공항)',
    };

    // 호주 시드니 킹스포드 스미스 국제공항
    const sydney: RoutePoint = {
      coordinate: [151.1772, -33.9399],
      label: '시드니(킹스포드스미스공항)',
    };

    // 순회 경로: 서울 → 샌프란시스코 → 토론토 → 런던 → 상파울루 → 요하네스버그 → 뭄바이 → 서울
    return [
      { from: seoul, to: sanFrancisco },
      { from: sanFrancisco, to: toronto },
      { from: toronto, to: london },
      { from: london, to: saoPaulo },
      { from: saoPaulo, to: johannesburg },
      { from: johannesburg, to: mumbai },
      { from: mumbai, to: seoul },
    ];
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
      {routes.map(({ from, to }, index) => (
        <RouteFeature
          from={from}
          to={to}
          maxHeight={0.1}
          lineWidth={5}
          animationDuration={1}
          animationDelay={index}
        />
      ))}
    </HyperGlobe>
  );
}
