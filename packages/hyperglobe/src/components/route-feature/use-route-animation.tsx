import { calcProgress } from '@hyperglobe/tools';
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useRef, useEffect } from 'react';
import { useMainStore } from 'src/store';
import { Matrix4, Mesh, Vector3 } from 'three';
import { objectScale } from 'three/tsl';

export interface UseRouteAnimationProps {
  animated?: boolean;
  animationDuration: number;
  animationDelay: number;
  fullPathPoints: Vector3[];
  minHeight: number;
  maxHeight: number;
  segments: number;
  from: [number, number];
  to: [number, number];
  objectScale: number;
}

export function useRouteAnimation({
  animated,
  animationDuration,
  animationDelay,
  fullPathPoints,
  minHeight,
  maxHeight,
  segments,
  from,
  to,
  objectScale,
}: UseRouteAnimationProps) {
  const loading = useMainStore((s) => s.loading);
  const headRef = useRef<Mesh>(null);
  const lineRef = useRef<any>(null);

  // 초기화: 애니메이션 활성화 시, 화면에 그릴 세그먼트 개수를 0으로 설정
  // 안하면 처음에 전체 경로가 다 그려져 버림
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
      const forward = new Vector3();
      if (tipIndex > 0) {
        const prevPoint = fullPathPoints[tipIndex - 1];
        forward.subVectors(currentPoint, prevPoint).normalize();
      } else if (fullPathPoints.length > 1) {
        const nextPoint = fullPathPoints[1];
        forward.subVectors(nextPoint, currentPoint).normalize();
      }

      // 2. Up (지구 중심 -> 바깥쪽 법선)
      const up = new Vector3().copy(currentPoint).normalize();

      // 3. Right (오른쪽 날개 방향)
      // 진행 방향과 법선의 외적을 구하면, 항상 지표면과 수평인 오른쪽 방향이 나옵니다.
      const right = new Vector3().crossVectors(forward, up).normalize();

      // 4. Corrected Up (진행 방향에 수직이 되도록 보정된 위쪽 방향)
      // 비행기의 등이 최대한 하늘을 보되, 진행 방향(Forward)을 최우선으로 하여 수직을 맞춥니다.
      const correctedUp = new Vector3().crossVectors(right, forward).normalize();

      // 5. 회전 행렬 적용
      // makeBasis(xAxis, yAxis, zAxis) 객체의 로컬 X, Y, Z축이 월드 공간에서 어디를 향할지를 설정.
      // 객체의 -Z축이 앞(Forward)이므로, Z축 인자에는 Forward의 negate를 전달합니다.
      const rotationMatrix = new Matrix4();
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
  }, [minHeight, maxHeight, segments, from, to, objectScale]);

  return { headRef, lineRef };
}
