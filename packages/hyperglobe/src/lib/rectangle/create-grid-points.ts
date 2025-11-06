import type { VectorCoordinate } from '@hyperglobe/interfaces';
import { OrthographicProj } from '../projections/orthographic';

export interface CreateGridVectorsParam {
  /**
   * 좌상단 꼭지점 좌표 (3D 직교좌표계)
   */
  leftTop: VectorCoordinate;
  /**
   * 우상단 꼭지점 좌표 (3D 직교좌표계)
   */
  rightTop: VectorCoordinate;
  /**
   * 우하단 꼭지점 좌표 (3D 직교좌표계)
   */
  rightBottom: VectorCoordinate;
  /**
   * 좌하단 꼭지점 좌표 (3D 직교좌표계)
   */
  leftBottom: VectorCoordinate;
  /**
   * 그리드 세분화 정도 (숫자가 클수록 더 부드러운 곡면)
   */
  subdivisions: number;
  /**
   * 구의 반지름
   */
  fillRadius: number;
}

/**
 * 사각형 영역을 구성하는 그리드 벡터를 생성합니다.
 *
 * - 좌표는 3D 직교좌표계의 좌표입니다.
 */
export function createGridPoints({
  leftTop,
  rightTop,
  rightBottom,
  leftBottom,
  subdivisions,
  fillRadius,
}: CreateGridVectorsParam) {
  // 네 변을 보간하여 엣지 생성(맨 위행의 점들과 맨 아래행의 점들을 생성.)
  const [topEdge, bottomEdge] = OrthographicProj.interpolates(
    [
      [leftTop, rightTop],
      [leftBottom, rightBottom],
    ],
    subdivisions,
    fillRadius
  );

  // 그리드 포인트 생성 (앞서 생성한 점을 이용해서 각 열을 보간)
  const gridPoints: VectorCoordinate[] = [];
  for (let i = 0; i <= subdivisions; i++) {
    const rowPoints = OrthographicProj.interpolate(
      topEdge[i],
      bottomEdge[i],
      subdivisions,
      fillRadius
    );
    gridPoints.push(...rowPoints);
  }

  return gridPoints;
}
