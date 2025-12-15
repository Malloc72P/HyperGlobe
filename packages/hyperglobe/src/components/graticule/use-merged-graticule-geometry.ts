import { useMemo } from 'react';
import { toRadian } from '../../../../hyperglobe-tools/src';

export interface UseMergedGraticuleGeometryOptions {
  /** 경선 간격 */
  longitudeStep: number;
  /** 위선 간격 */
  latitudeStep: number;
}

/**
 * 모든 경위선의 좌표를 하나의 배열로 병합하는 훅
 *
 * ### 최적화 방식
 * - 개별 Line 컴포넌트 대신 하나의 Line으로 병합하여 드로우콜 최소화
 * - segments 모드를 사용하여 연결되지 않은 여러 선분을 효율적으로 렌더링
 *
 * ### 드로우콜 비교
 * - 기존 방식: 경선 18개 + 위선 36개 = 54 드로우콜
 * - 최적화 후: 1 드로우콜
 *
 * @returns 병합된 좌표 배열
 */
export function useMergedGraticuleGeometry({
  longitudeStep,
  latitudeStep,
}: UseMergedGraticuleGeometryOptions): number[] {
  return useMemo(() => {
    const points: number[] = [];

    // 위선 생성
    const latitudeCount = 90 / latitudeStep;
    for (let i = 0; i < latitudeCount; i++) {
      const currentLat = i * latitudeStep;
      const y = Math.sin(toRadian(currentLat));

      // 극점은 건너뛰기
      if (Math.abs(y) === 1) continue;

      const radius = Math.sqrt(1 - y * y) + 0.0006;

      // 양의 위도 (북반구)
      addLatitudeLine(points, y, radius);

      // 음의 위도 (남반구)
      if (y !== 0) {
        addLatitudeLine(points, -y, radius);
      }
    }

    // 경선 생성
    const longitudeCount = 180 / longitudeStep;
    for (let i = 0; i < longitudeCount; i++) {
      const currentLongitude = i * longitudeStep;
      const rotateY = toRadian(currentLongitude);

      addLongitudeLine(points, rotateY);
    }

    return points;
  }, [longitudeStep, latitudeStep]);
}

/**
 * 위선(latitude line) 좌표 추가
 * - 동서 방향으로 지구를 도는 원
 * - XZ 평면상의 원을 Y축으로 이동
 * - segments 모드를 위해 각 선분을 독립적으로 추가
 */
function addLatitudeLine(points: number[], y: number, radius: number): void {
  const segmentCount = 90;

  for (let i = 0; i < segmentCount; i++) {
    const angle1 = (i / segmentCount) * Math.PI * 2;
    const angle2 = ((i + 1) / segmentCount) * Math.PI * 2;

    // 시작점
    const x1 = Math.cos(angle1) * radius;
    const z1 = Math.sin(angle1) * radius;
    points.push(x1, y, z1);

    // 끝점
    const x2 = Math.cos(angle2) * radius;
    const z2 = Math.sin(angle2) * radius;
    points.push(x2, y, z2);
  }
}

/**
 * 경선(longitude line) 좌표 추가
 * - 남북 방향으로 지구를 도는 반원
 * - YZ 평면상의 원을 Y축 중심으로 회전
 * - segments 모드를 위해 각 선분을 독립적으로 추가
 */
function addLongitudeLine(points: number[], rotateY: number): void {
  const segmentCount = 90;
  const radius = 1.0006;

  const cosY = Math.cos(rotateY);
  const sinY = Math.sin(rotateY);

  for (let i = 0; i < segmentCount; i++) {
    const angle1 = (i / segmentCount) * Math.PI * 2;
    const angle2 = ((i + 1) / segmentCount) * Math.PI * 2;

    // 시작점의 YZ 평면상의 좌표
    const localY1 = Math.cos(angle1) * radius;
    const localZ1 = Math.sin(angle1) * radius;

    // Y축 중심 회전 적용 (시작점)
    const x1 = localZ1 * sinY;
    const y1 = localY1;
    const z1 = localZ1 * cosY;
    points.push(x1, y1, z1);

    // 끝점의 YZ 평면상의 좌표
    const localY2 = Math.cos(angle2) * radius;
    const localZ2 = Math.sin(angle2) * radius;

    // Y축 중심 회전 적용 (끝점)
    const x2 = localZ2 * sinY;
    const y2 = localY2;
    const z2 = localZ2 * cosY;
    points.push(x2, y2, z2);
  }
}
