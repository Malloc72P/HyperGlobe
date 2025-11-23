import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { applyHeight, createGreatCirclePath, OrthographicProj } from '@hyperglobe/tools';
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

  /**
   * 애니메이션 중 경로 끝에 표시할 도형 타입 (기본값: 'arrow')
   */
  objectShape?: 'arrow' | 'plane';

  /**
   * 도형 크기 스케일 (기본값: 1)
   */
  objectScale?: number;
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
  objectShape = 'arrow',
  objectScale = 1,
}: RouteFeatureProps) {
  const loading = useMainStore((s) => s.loading);
  const [appliedStyle] = useFeatureStyle({ style });

  const objectRef = useRef<THREE.Mesh>(null);

  const objectGeometry = useMemo(() => {
    let geo: THREE.BufferGeometry;
    if (objectShape === 'plane') {
      geo = createPlaneGeometry();
    } else {
      // Default arrow
      geo = new THREE.ConeGeometry(0.02, 0.06, 8);
      // lookAt은 -Z축을 바라보게 하므로, 뿔이 -Z를 향하도록 회전
      geo.rotateX(-Math.PI / 2);
    }
    return geo;
  }, [objectShape]);

  // 1. 전체 경로를 미리 계산 (절대 state로 자르지 마세요!)
  const fullPathPoints = useMemo(() => {
    const points = createGreatCirclePath(from, to, segments);
    applyHeight(points, minHeight, maxHeight, segments);
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

    if (hasFinished || !animated || !lineRef.current || loading) {
      if (objectRef.current) objectRef.current.visible = false;
      return;
    }

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

    // 도형 위치 및 회전 업데이트
    if (objectRef.current) {
      objectRef.current.visible = true;
      objectRef.current.scale.setScalar(objectScale);

      const tipIndex = Math.min(visibleSegments, fullPathPoints.length - 1);
      const currentPoint = fullPathPoints[tipIndex];
      objectRef.current.position.copy(currentPoint);

      if (tipIndex < fullPathPoints.length - 1) {
        objectRef.current.lookAt(fullPathPoints[tipIndex + 1]);
      } else if (tipIndex > 0) {
        const prevPoint = fullPathPoints[tipIndex - 1];
        const dir = new THREE.Vector3().subVectors(currentPoint, prevPoint).normalize();
        const target = new THREE.Vector3().addVectors(currentPoint, dir);
        objectRef.current.lookAt(target);
      }
    }

    if (progress >= 1) {
      // 애니메이션 완료
      animationState.current.hasFinished = true;
      if (objectRef.current) objectRef.current.visible = false;
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
        <mesh ref={objectRef} geometry={objectGeometry} visible={false}>
          <meshBasicMaterial color={appliedStyle.color} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function createPlaneGeometry() {
  const geometry = new THREE.BufferGeometry();

  // Simple paper plane
  // Tip at (0, 0, -0.04) (Forward -Z)
  // Wings at +/- X
  const vertices = [
    // Left Wing
    0,
    0,
    -0.04,
    -0.03,
    0,
    0.03,
    0,
    0,
    0.03,
    // Right Wing
    0,
    0,
    -0.04,
    0,
    0,
    0.03,
    0.03,
    0,
    0.03,
    // Vertical Fin (Bottom)
    0,
    0,
    -0.04,
    0,
    -0.015,
    0.03,
    -0.005,
    0,
    0.03, // Left side of fin
    0,
    0,
    -0.04,
    0.005,
    0,
    0.03,
    0,
    -0.015,
    0.03, // Right side of fin
  ];

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}
