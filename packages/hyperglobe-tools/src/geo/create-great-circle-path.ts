import { Coordinate } from '@hyperglobe/interfaces';
import { OrthographicProj } from '../projections';
import { Vector3 } from 'three';

/**
 * 대권항로 생성 (SLERP 사용)
 */
export function createGreatCirclePath(
  from: Coordinate,
  to: Coordinate,
  segments: number
): Vector3[] {
  const globeRadius = 1; // 정규화된 반지름 (Three.js sphere의 기본 반지름)
  const fromVector = new Vector3(...OrthographicProj.project(from, globeRadius));
  const toVector = new Vector3(...OrthographicProj.project(to, globeRadius));

  const pathPoints: Vector3[] = [];

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
      const point = new Vector3().lerpVectors(fromVector, toVector, t);
      point.normalize().multiplyScalar(globeRadius);
      pathPoints.push(point);
    } else {
      const ratioA = Math.sin((1 - t) * angle) / sinAngle;
      const ratioB = Math.sin(t * angle) / sinAngle;

      const point = new Vector3()
        .addScaledVector(fromVector, ratioA)
        .addScaledVector(toVector, ratioB)
        .normalize()
        .multiplyScalar(globeRadius);

      pathPoints.push(point);
    }
  }

  return pathPoints;
}
