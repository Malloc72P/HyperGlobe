import type { VectorCoordinate } from '../../types/coordinate';
import { normalize, cross } from './spherical-geometry';

/**
 * 3D 구면 좌표들을 로컬 2D 평면에 투영
 *
 * @param vertices - 3D 구면 좌표 배열
 * @returns 2D 평면 좌표 배열
 */
export function projectToPlane(vertices: VectorCoordinate[]): [number, number][] {
  if (vertices.length < 3) {
    return [];
  }

  // 1. 폴리곤의 중심점 계산
  const center: VectorCoordinate = [0, 0, 0];
  for (const v of vertices) {
    center[0] += v[0];
    center[1] += v[1];
    center[2] += v[2];
  }
  center[0] /= vertices.length;
  center[1] /= vertices.length;
  center[2] /= vertices.length;

  // 2. 중심점을 법선 벡터로 사용 (구의 중심에서 폴리곤 중심으로의 벡터)
  const normal = normalize(center);

  // 3. 로컬 좌표계의 기저 벡터 생성
  // 임의의 벡터를 선택 (법선과 평행하지 않은 벡터)
  let arbitrary: VectorCoordinate;
  if (Math.abs(normal[0]) < 0.9) {
    arbitrary = [1, 0, 0];
  } else {
    arbitrary = [0, 1, 0];
  }

  // tangent = normalize(cross(normal, arbitrary))
  const tangent = normalize(cross(normal, arbitrary));

  // bitangent = normalize(cross(normal, tangent))
  const bitangent = normalize(cross(normal, tangent));

  // 4. 각 3D 점을 2D 평면에 투영
  const projected: [number, number][] = [];
  for (const v of vertices) {
    // 중심점에서의 상대 위치
    const relative: VectorCoordinate = [v[0] - center[0], v[1] - center[1], v[2] - center[2]];

    // 로컬 좌표계로 투영 (내적 사용)
    const x = relative[0] * tangent[0] + relative[1] * tangent[1] + relative[2] * tangent[2];
    const y = relative[0] * bitangent[0] + relative[1] * bitangent[1] + relative[2] * bitangent[2];

    projected.push([x, y]);
  }

  return projected;
}
