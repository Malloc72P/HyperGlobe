import type { VectorCoordinate } from '../../types/coordinate';

export interface TessellatedGridParam {
  gridPoints: VectorCoordinate[];
  subdivisions: number;
}

export function tessellateGrid({ gridPoints, subdivisions }: TessellatedGridParam) {
  // 3. Vertices 배열 생성
  const vertices = gridPoints.flatMap((point) => [point[0], point[1], point[2]]);

  // 4. 삼각형 인덱스 생성
  const indices: number[] = [];
  const rowSize = subdivisions + 1;

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
