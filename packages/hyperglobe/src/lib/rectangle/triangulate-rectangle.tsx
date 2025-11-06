import type { VectorCoordinate } from '../../../../hyperglobe-interface/src/coordinate';

export interface triangulateRectangleOption {
  gridPoints: VectorCoordinate[];
  subdivisions: number;
}

/**
 * ### 사각형 삼각분할 함수.
 *
 * - 주어진 그리드 포인트와 세분화 정도를 바탕으로 사각형을 삼각형으로 분할하여 인덱스 배열을 생성합니다.
 */
export function triangulateRectangle({ gridPoints, subdivisions }: triangulateRectangleOption) {
  // Vertices 배열 생성
  const vertices = gridPoints.flatMap((point) => [point[0], point[1], point[2]]);

  // 삼각형 인덱스 생성
  const indices: number[] = [];
  const rowSize = subdivisions + 1;

  // 각각의 그리드 포인트 마다 두 개의 삼각형 생성.
  for (let row = 0; row < subdivisions; row++) {
    for (let col = 0; col < subdivisions; col++) {
      const topLeft = row * rowSize + col;
      const topRight = topLeft + 1;
      const bottomLeft = (row + 1) * rowSize + col;
      const bottomRight = bottomLeft + 1;

      // 첫 번째 삼각형
      indices.push(topLeft, bottomLeft, topRight);
      // 두 번째 삼각형
      indices.push(topRight, bottomLeft, bottomRight);
    }
  }

  return indices;
}
