import type { Coordinate } from '@hyperglobe/interfaces';
import { Line } from '@react-three/drei';
import { UiConstant } from 'src/constants';
import { FeatureStyle } from 'src/types/feature';
import * as THREE from 'three';
import { useFeatureStyle } from '../../hooks/use-feature-style';
import { MarkerFeature } from '../marker-feature/marker-feature';
import { useRouteAnimation } from './use-route-animation';
import { useRouteGeometry } from './use-route-geometry';
import { useRouteMarker } from './use-route-marker';
import { SvgStyle } from 'src/types/svg';

export interface RoutePoint {
  coordinate: Coordinate;
  label?: string;
  style?: SvgStyle;
}

export interface RouteFeatureProps {
  /**
   * 시작점 정보
   */
  from: RoutePoint;

  /**
   * 끝점 정보
   */
  to: RoutePoint;

  /**
   * 최대 높이 (중간점)
   */
  maxHeight: number;

  /**
   * 선 너비
   */
  lineWidth: number;

  /**
   * 경로 보간 개수 (기본값: 500)
   */
  segments?: number;

  /**
   * 스타일
   */
  style?: FeatureStyle;

  /**
   * 애니메이션 활성화 여부 (기본값: true)
   */
  animated?: boolean;

  /**
   * 애니메이션 지속 시간 (밀리초, 기본값: 1000)
   */
  animationDuration?: number;

  /**
   * 애니메이션 시작 딜레이 (밀리초, 기본값: 0)
   */
  animationDelay?: number;

  /**
   * 도형 크기 스케일 (기본값: 1)
   */
  objectScale?: number;
}

/**
 * 지구본 위에 두 지점을 연결하는 3D 경로를 렌더링하는 컴포넌트입니다.
 *
 * - 대권항로(Great Circle) 기반 경로 생성
 * - 포물선 형태의 높이 적용 가능
 * - 애니메이션 지원 (경로 그리기)
 * - 시작점과 끝점에 마커 표시
 */
export function RouteFeature({
  from,
  to,
  maxHeight,
  lineWidth,
  segments = 500,
  style,
  animated = true,
  animationDuration = 1000,
  animationDelay = 0,
  objectScale = 1,
}: RouteFeatureProps) {
  const minHeight = UiConstant.feature.strokeRadius - 1;
  const [appliedStyle] = useFeatureStyle({ style });

  const [fromMarker] = useRouteMarker({ point: from });
  const [toMarker] = useRouteMarker({ point: to });

  const { fullPathPoints, objectGeometry } = useRouteGeometry({
    from: from.coordinate,
    to: to.coordinate,
    minHeight,
    maxHeight,
    segments,
  });

  const { lineRef, headRef } = useRouteAnimation({
    animationDuration,
    animationDelay,
    objectScale,
    from: from.coordinate,
    to: to.coordinate,
    fullPathPoints,
    minHeight,
    maxHeight,
    segments,
    animated,
  });

  return (
    <group>
      <Line
        ref={lineRef}
        // 중요: 전체 경로를 처음부터 다 전달해서 버퍼를 풀 사이즈로 확보한다.
        points={fullPathPoints}
        color={appliedStyle.color}
        lineWidth={lineWidth}
        opacity={appliedStyle.fillOpacity}
        transparent={appliedStyle.fillOpacity !== undefined && appliedStyle.fillOpacity < 1}
      />
      {animated && (
        <mesh ref={headRef} geometry={objectGeometry} visible={false}>
          <meshBasicMaterial color={appliedStyle.color} side={THREE.DoubleSide} />
        </mesh>
      )}

      {from.label && <MarkerFeature {...fromMarker} />}
      {to.label && <MarkerFeature {...toMarker} />}
    </group>
  );
}
