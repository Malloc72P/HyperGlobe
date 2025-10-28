import type { VectorCoordinate } from '../../types/coordinate';
import { isEar, isCounterClockwise } from './spherical-geometry';

/**
 * 구면 Ear Clipping 알고리즘을 사용한 삼각분할
 *
 * @param vertices - 3D 구면 좌표 배열
 * @returns 삼각형 인덱스 배열 (3개씩 하나의 삼각형)
 *
 * @example
 * ```ts
 * const vertices: VectorCoordinate[] = [
 *   [1, 0, 0],
 *   [0, 0, 1],
 *   [-1, 0, 0],
 *   [0, 0, -1]
 * ];
 * const indices = sphericalEarcut(vertices);
 * // indices: [0, 1, 2, 0, 2, 3] (삼각형 2개)
 * ```
 */
export function sphericalEarcut(vertices: VectorCoordinate[]): number[] {
  const n = vertices.length;

  // 최소 3개의 점이 필요
  if (n < 3) {
    return [];
  }

  // 3개의 점이면 바로 삼각형 하나 반환
  if (n === 3) {
    return [0, 1, 2];
  }

  const indices: number[] = [];

  // 현재 처리 중인 정점들의 인덱스 목록
  const remainingIndices: number[] = Array.from({ length: n }, (_, i) => i);

  // 폴리곤이 시계방향이면 반시계방향으로 뒤집기
  const isCCW = isCounterClockwise(vertices);
  if (!isCCW) {
    remainingIndices.reverse();
  }

  // 모든 정점이 처리될 때까지 반복
  let iterationCount = 0;
  const maxIterations = n * n; // 무한루프 방지
  let consecutiveFailures = 0; // 연속 실패 카운트

  while (remainingIndices.length > 3 && iterationCount < maxIterations) {
    iterationCount++;

    let earFound = false;
    const currentLength = remainingIndices.length;

    // 현재 남은 정점들 중에서 ear 찾기
    for (let i = 0; i < currentLength; i++) {
      const prevIdx = remainingIndices[(i - 1 + currentLength) % currentLength];
      const currIdx = remainingIndices[i];
      const nextIdx = remainingIndices[(i + 1) % currentLength];

      // ear인지 확인 (인덱스를 직접 전달)
      if (isEar(prevIdx, currIdx, nextIdx, vertices, remainingIndices)) {
        // 삼각형 인덱스 추가
        indices.push(prevIdx, currIdx, nextIdx);

        // 현재 정점 제거
        remainingIndices.splice(i, 1);

        earFound = true;
        consecutiveFailures = 0;
        break;
      }
    }

    // ear를 찾지 못한 경우
    if (!earFound) {
      consecutiveFailures++;

      // 여러 번 실패하면 강제로 첫 번째 삼각형을 만들어 진행
      if (consecutiveFailures > 2) {
        console.warn('Spherical ear clipping: forcing triangle creation', {
          remaining: remainingIndices.length,
          iteration: iterationCount,
        });

        if (remainingIndices.length >= 3) {
          indices.push(remainingIndices[0], remainingIndices[1], remainingIndices[2]);
          remainingIndices.splice(1, 1); // 중간 정점 제거
          consecutiveFailures = 0;
        } else {
          break;
        }
      }
    }
  }

  // 마지막 남은 3개 정점으로 삼각형 생성
  if (remainingIndices.length === 3) {
    indices.push(remainingIndices[0], remainingIndices[1], remainingIndices[2]);
  } else if (remainingIndices.length > 3) {
    console.warn('Spherical ear clipping incomplete:', {
      remaining: remainingIndices.length,
      total: n,
    });
  }

  // 무한루프가 발생했다면 경고
  if (iterationCount >= maxIterations) {
    console.warn('Spherical ear clipping: max iterations reached');
  }

  return indices;
}
