import RBush from 'rbush';
import { RegionModel, VectorCoordinate } from '@hyperglobe/interfaces';
import { Euler, Matrix4, Vector3 } from 'three';
import { CoordinateConverter } from '../coordinate';
import { isPointInPolygon } from './is-point-in-polygon';

export interface FindRegionByVectorOptions {
  rotation: [number, number, number];
  vector: { x: number; y: number; z: number };
  rTree: RBush<RegionModel>;
}

export function findRegionByVector({ rotation, vector, rTree }: FindRegionByVectorOptions) {
  // 월드 좌표.
  // 이 좌표는 회전이 적용된 후의 좌표이다.
  // 해당 좌표의 경위도 좌표를 구하려면, 회전을 상쇄시키고 역변환해야한다.
  const point = vector;

  // 회전 상쇄를 위한 회전행렬에 대한 역행렬 계산
  const inverseMatrix = new Matrix4();
  inverseMatrix.makeRotationFromEuler(new Euler(...rotation));
  inverseMatrix.invert();

  // 역행렬을 적용하여 회전이 상쇄된 로컬 좌표 계산
  const localPoint = new Vector3(point.x, point.y, point.z).applyMatrix4(inverseMatrix);
  const { x, y, z } = localPoint;

  // 역변환
  const coordinate = CoordinateConverter.invert([x, y, z]);
  let foundRegion: null | RegionModel = null;
  const searchResult = rTree
    .search({
      minX: coordinate[0],
      minY: coordinate[1],
      maxX: coordinate[0],
      maxY: coordinate[1],
    })
    .sort((a, b) => a.bboxSize - b.bboxSize);

  for (const region of searchResult) {
    let found = false;
    const polygons = region.polygons;

    for (const polygon of polygons) {
      if (isPointInPolygon(coordinate, polygon)) {
        // 해당 좌표가 이 폴리곤 내부에 있음
        found = true;
        break;
      }
    }

    if (found) {
      foundRegion = region;
      break;
    }
  }

  return foundRegion;
}
