import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { OrthographicProj } from '@hyperglobe/tools';
import type { Coordinate } from '@hyperglobe/interfaces';
import { FeatureStyle } from 'src/types/feature';
import { useFeatureStyle } from '../../hooks/use-feature-style';
import { useMainStore } from 'src/store';

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
  minHeight: number;

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
}

export function RouteFeature({
  from,
  to,
  minHeight,
  maxHeight,
  lineWidth,
  segments = 50,
  style,
  animated = true,
  animationDuration = 2,
  animationDelay = 0,
}: RouteFeatureProps) {
  const loading = useMainStore((s) => s.loading);
  const [appliedStyle] = useFeatureStyle({ style });

  // 1. 전체 경로를 미리 계산 (절대 state로 자르지 마세요!)
  const fullPathPoints = useMemo(() => {
    const points = createGreatCirclePath(from, to, segments);
    applyHeightProfile(points, minHeight, maxHeight, segments);
    return points;
  }, [from, to, minHeight, maxHeight, segments]);

  const lineRef = useRef<any>(null);

  // 초기화: 애니메이션 활성화 시, 화면에 그릴 세그먼트 개수를 0으로 설정
  useLayoutEffect(() => {
    if (animated && lineRef.current) {
      // Drei Line(Line2)은 InstancedMesh 기술을 사용한다.
      // instanceCount를 0으로 하면 아무것도 안 그려진다.
      lineRef.current.geometry.instanceCount = 0;
    }
  }, [animated, fullPathPoints]); // 경로가 바뀌면 다시 0으로 초기화

  // 애니메이션 상태 관리
  const animationState = useRef({
    startTime: 0,
    hasStarted: false,
    hasFinished: false,
  });

  useFrame((state) => {
    const { startTime = 0, hasStarted, hasFinished } = animationState.current;

    if (hasFinished || !animated || !lineRef.current || loading) return;

    // 딜레이 처리
    if (!hasStarted) {
      if (startTime === null) {
        animationState.current.startTime = state.clock.elapsedTime;
        return;
      }
      const delayElapsed = state.clock.elapsedTime - startTime;
      if (delayElapsed < animationDelay) return;

      animationState.current.hasStarted = true;
      animationState.current.startTime = state.clock.elapsedTime;
      return;
    }

    // 진행률 계산
    const elapsed = state.clock.elapsedTime - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);

    // 현재 프레임에 그릴 세그먼트 개수 계산. 전체 점이 N개면, 선분(세그먼트)은 N-1개임에 주의
    const totalSegments = fullPathPoints.length - 1;
    const visibleSegments = Math.floor(totalSegments * progress);

    // geometry의 instanceCount만 조절하면 그릴 선분 개수를 제어할 수 있다.
    lineRef.current.geometry.instanceCount = Math.max(0, visibleSegments);

    if (progress >= 1) {
      // 애니메이션 완료
      animationState.current.hasFinished = true;
    }
  });

  useEffect(() => {
    animationState.current = {
      startTime: 0,
      hasStarted: false,
      hasFinished: false,
    };
  }, [minHeight, maxHeight, segments, from, to]);

  return (
    <Line
      ref={lineRef}
      // 중요: 전체 경로를 처음부터 다 전달해서 버퍼를 풀 사이즈로 확보한다.
      points={fullPathPoints}
      color={appliedStyle.color}
      lineWidth={lineWidth}
      opacity={appliedStyle.fillOpacity}
      transparent={appliedStyle.fillOpacity !== undefined && appliedStyle.fillOpacity < 1}
    />
  );
}

/**
 * 대권항로 생성 (SLERP 사용)
 */
function createGreatCirclePath(
  from: Coordinate,
  to: Coordinate,
  segments: number
): THREE.Vector3[] {
  const globeRadius = 1; // 정규화된 반지름 (Three.js sphere의 기본 반지름)
  const fromVector = new THREE.Vector3(...OrthographicProj.project(from, globeRadius));
  const toVector = new THREE.Vector3(...OrthographicProj.project(to, globeRadius));

  const pathPoints: THREE.Vector3[] = [];

  // 정규화
  fromVector.normalize();
  toVector.normalize();

  // 두 벡터 사이의 각도 계산
  const angle = fromVector.angleTo(toVector);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    // SLERP: Spherical Linear Interpolation
    // slerp(v1, v2, t) = (sin((1-t)*θ) / sin(θ)) * v1 + (sin(t*θ) / sin(θ)) * v2
    const sinAngle = Math.sin(angle);

    if (sinAngle < 0.001) {
      // 각도가 너무 작으면 선형 보간 사용
      const point = new THREE.Vector3().lerpVectors(fromVector, toVector, t);
      point.normalize().multiplyScalar(globeRadius);
      pathPoints.push(point);
    } else {
      const ratioA = Math.sin((1 - t) * angle) / sinAngle;
      const ratioB = Math.sin(t * angle) / sinAngle;

      const point = new THREE.Vector3()
        .addScaledVector(fromVector, ratioA)
        .addScaledVector(toVector, ratioB)
        .normalize()
        .multiplyScalar(globeRadius);

      pathPoints.push(point);
    }
  }

  return pathPoints;
}

/**
 * 높이 프로필 적용 (부드러운 포물선 프로필)
 */
function applyHeightProfile(
  pathPoints: THREE.Vector3[],
  minHeight: number,
  maxHeight: number,
  segments: number
): void {
  for (let i = 0; i < pathPoints.length; i++) {
    // 0 ~ 1로 정규화
    const t = i / segments;

    // Sin 함수로 부드러운 포물선 (0 → 1 → 0)
    // sin(πt)는 0에서 시작해서 0.5에서 최대값 1, 1에서 다시 0
    const heightFactor = Math.sin(t * Math.PI);

    const height = minHeight + (maxHeight - minHeight) * heightFactor;
    const currentRadius = pathPoints[i].length();
    pathPoints[i].multiplyScalar((currentRadius + height) / currentRadius);
  }
}
