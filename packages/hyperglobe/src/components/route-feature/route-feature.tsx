import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  applyHeight,
  calcProgress,
  createGreatCirclePath,
  OrthographicProj,
} from '@hyperglobe/tools';
import type { Coordinate } from '@hyperglobe/interfaces';
import { FeatureStyle } from 'src/types/feature';
import { useFeatureStyle } from '../../hooks/use-feature-style';
import { useMainStore } from 'src/store';
import { UiConstant } from 'src/constants';
import { useRouteAnimation } from './use-route-animation';
import { useRouteGeometry } from './use-route-geometry';

export interface RouteFeatureProps {
  /**
   * 시작점 좌표 [경도, 위도]
   */
  from: Coordinate;

  /**
   * 끝점 좌표 [경도, 위도]
   */
  to: Coordinate;

  /**
   * 최소 높이 (시작점/끝점)
   */
  //   minHeight: number;

  /**
   * 최대 높이 (중간점)
   */
  maxHeight: number;

  /**
   * 선 너비
   */
  lineWidth: number;

  /**
   * 경로 보간 개수 (기본값: 50)
   */
  segments?: number;

  /**
   * 스타일
   */
  style?: FeatureStyle;

  /**
   * 애니메이션 활성화 여부 (기본값: false)
   */
  animated?: boolean;

  /**
   * 애니메이션 지속 시간 (초 단위, 기본값: 2)
   */
  animationDuration?: number;

  /**
   * 애니메이션 시작 딜레이 (초 단위, 기본값: 0)
   */
  animationDelay?: number;

  /**
   * 도형 크기 스케일 (기본값: 1)
   */
  objectScale?: number;
}

export function RouteFeature({
  from,
  to,
  //   minHeight,
  maxHeight,
  lineWidth,
  segments = 50,
  style,
  animated = true,
  animationDuration = 2,
  animationDelay = 0,
  objectScale = 1,
}: RouteFeatureProps) {
  const minHeight = UiConstant.feature.strokeRadius - 1;
  const [appliedStyle] = useFeatureStyle({ style });

  const { fullPathPoints, objectGeometry } = useRouteGeometry({
    from,
    to,
    minHeight,
    maxHeight,
    segments,
  });

  const { lineRef, headRef } = useRouteAnimation({
    animationDuration,
    animationDelay,
    objectScale,
    from,
    to,
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
    </group>
  );
}
