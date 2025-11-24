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
  objectShape?: 'cone' | 'arrow';

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

  const headRef = useRef<THREE.Mesh>(null);

  const objectGeometry = useMemo(() => {
    let geo: THREE.BufferGeometry;
    if (objectShape === 'arrow') {
      geo = createArrowGeometry();
    } else {
      // Default arrow
      geo = new THREE.ConeGeometry(0.02, 0.06, 8);
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
  const animationStateRef = useRef({
    startTime: 0,
    hasStarted: false,
    hasFinished: false,
  });

  useFrame((state) => {
    const { startTime = 0, hasStarted, hasFinished } = animationStateRef.current;
    const animationState = animationStateRef.current;
    const line = lineRef.current;
    const head = headRef.current;

    if (hasFinished || !animated || !line || loading) {
      if (head) head.visible = false;
      return;
    }

    // 딜레이 처리
    if (!hasStarted) {
      if (startTime === null) {
        animationState.startTime = state.clock.elapsedTime;
        return;
      }
      const delayElapsed = state.clock.elapsedTime - startTime;
      if (delayElapsed < animationDelay) return;

      animationState.hasStarted = true;
      animationState.startTime = state.clock.elapsedTime;
      return;
    }

    // 진행률 계산
    const progress = calcProgress(state.clock.elapsedTime, startTime, animationDuration);

    // 현재 프레임에 그릴 세그먼트 개수 계산. 전체 점이 N개면, 선분(세그먼트)은 N-1개.
    const totalSegments = fullPathPoints.length - 1;
    const visibleSegments = Math.floor(totalSegments * progress);

    // geometry의 instanceCount만 조절하면 그릴 선분 개수를 제어할 수 있다.
    line.geometry.instanceCount = Math.max(0, visibleSegments);

    // 도형 위치 및 회전 업데이트
    if (head) {
      head.visible = true;
      head.scale.setScalar(objectScale);

      // 헤드 위치 업데이트
      const tipIndex = Math.min(visibleSegments, fullPathPoints.length - 1);
      const currentPoint = fullPathPoints[tipIndex];

      head.position.copy(currentPoint);

      // 회전 행렬을 이용한 정밀한 자세 제어
      // 1. Forward (진행 방향)
      const forward = new THREE.Vector3();
      if (tipIndex > 0) {
        const prevPoint = fullPathPoints[tipIndex - 1];
        forward.subVectors(currentPoint, prevPoint).normalize();
      } else if (fullPathPoints.length > 1) {
        const nextPoint = fullPathPoints[1];
        forward.subVectors(nextPoint, currentPoint).normalize();
      }

      // 2. Up (지구 중심 -> 바깥쪽 법선)
      const up = new THREE.Vector3().copy(currentPoint).normalize();

      // 3. Right (오른쪽 날개 방향)
      // 진행 방향과 법선의 외적을 구하면, 항상 지표면과 수평인 오른쪽 방향이 나옵니다.
      const right = new THREE.Vector3().crossVectors(forward, up).normalize();

      // 4. Corrected Up (진행 방향에 수직이 되도록 보정된 위쪽 방향)
      // 비행기의 등이 최대한 하늘을 보되, 진행 방향(Forward)을 최우선으로 하여 수직을 맞춥니다.
      const correctedUp = new THREE.Vector3().crossVectors(right, forward).normalize();

      // 5. 회전 행렬 적용
      // makeBasis(xAxis, yAxis, zAxis) 객체의 로컬 X, Y, Z축이 월드 공간에서 어디를 향할지를 설정.
      // 객체의 -Z축이 앞(Forward)이므로, Z축 인자에는 Forward의 negate를 전달합니다.
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeBasis(right, correctedUp, forward.clone().negate());

      head.quaternion.setFromRotationMatrix(rotationMatrix);
    }

    if (progress >= 1) {
      // 애니메이션 완료
      animationState.hasFinished = true;
      if (headRef.current) headRef.current.visible = false;
    }
  });

  useEffect(() => {
    animationStateRef.current = {
      startTime: 0,
      hasStarted: false,
      hasFinished: false,
    };
  }, [minHeight, maxHeight, segments, from, to, objectShape, objectScale]);

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

function createArrowGeometry() {
  const geometry = new THREE.BufferGeometry();

  // Flat Arrow (Plane) - Triangle only
  // Tip at (0, 0, -0.04) (Forward -Z)
  // Base width +/- 0.02
  const vertices = [
    // Triangle Head
    0,
    0,
    -0.04, // Tip
    -0.02,
    0,
    0, // Left Base
    0.02,
    0,
    0, // Right Base
  ];

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}
