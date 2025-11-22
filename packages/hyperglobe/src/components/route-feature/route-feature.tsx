import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { OrthographicProj } from '@hyperglobe/tools';
import type { Coordinate } from '@hyperglobe/interfaces';
import { FeatureStyle } from 'src/types/feature';
import { useFeatureStyle } from '../../hooks/use-feature-style';

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
}

/**
 * RouteFeature - drei의 Line을 사용한 단순한 경로 렌더링
 *
 * - 대권항로(Great Circle)를 따라 경로 생성
 * - 높이 프로필 적용 (포물선 형태)
 * - 선 굵기는 일정
 */
export function RouteFeature({
  from,
  to,
  minHeight,
  maxHeight,
  lineWidth,
  segments = 50,
  style,
}: RouteFeatureProps) {
  const [appliedStyle] = useFeatureStyle({ style });

  const pathPoints = useMemo(() => {
    // 1. 대권항로 생성
    const points = createGreatCirclePath(from, to, segments);

    // 2. 높이 프로필 적용
    applyHeightProfile(points, minHeight, maxHeight, segments);

    return points;
  }, [from, to, minHeight, maxHeight, segments]);

  return (
    <Line
      points={pathPoints}
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
