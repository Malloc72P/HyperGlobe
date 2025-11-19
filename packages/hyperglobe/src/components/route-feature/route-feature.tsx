import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MathConstants, OrthographicProj } from '@hyperglobe/tools';
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
   * 최대 선 너비
   */
  lineWidth: number;

  /**
   * 최소 선 너비 (기본값: lineWidth * 0.3)
   */
  minWidth?: number;

  /**
   * 화살촉 길이 (향후 구현)
   */
  arrowLength?: number;

  /**
   * 화살촉 너비 (향후 구현)
   */
  arrowWidth?: number;

  /**
   * 경로 보간 개수 (기본값: 50)
   */
  segments?: number;

  /**
   * 3D 두께/오프셋 (기본값: 0.01)
   */
  thickness?: number;

  /**
   * 스타일
   */
  style?: FeatureStyle;
}

export function RouteFeature({
  from,
  to,
  minHeight,
  maxHeight,
  lineWidth,
  minWidth = lineWidth * 0.3,
  segments = 50,
  thickness = 0.01,
  style,
}: RouteFeatureProps) {
  const [appliedStyle] = useFeatureStyle({ style });

  const geometry = useMemo(() => {
    // Phase 1: 기본 경로 구현 (화살촉 제외)
    return createRouteGeometry({
      from,
      to,
      minHeight,
      maxHeight,
      lineWidth,
      minWidth,
      segments,
      thickness,
    });
  }, [from, to, minHeight, maxHeight, lineWidth, minWidth, segments, thickness]);

  if (!geometry) {
    return null;
  }

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={appliedStyle.color}
        opacity={appliedStyle.fillOpacity}
        transparent={appliedStyle.fillOpacity !== undefined && appliedStyle.fillOpacity < 1}
      />
    </mesh>
  );
}

interface CreateRouteGeometryOptions {
  from: Coordinate;
  to: Coordinate;
  minHeight: number;
  maxHeight: number;
  lineWidth: number;
  minWidth: number;
  segments: number;
  thickness: number;
}

function createRouteGeometry(options: CreateRouteGeometryOptions): THREE.BufferGeometry | null {
  const { from, to, minHeight, maxHeight, lineWidth, minWidth, segments, thickness } = options;

  // 1단계: 대권항로 생성
  const pathPoints = createGreatCirclePath(from, to, segments);

  // 2단계: 높이 프로필 적용
  applyHeightProfile(pathPoints, minHeight, maxHeight, segments);

  // 3단계: 너비 프로필 및 가장자리 생성
  const { leftEdge, rightEdge } = createEdges(pathPoints, minWidth, lineWidth);

  // 4단계: 닫힌 폴리곤 구성 및 삼각분할
  const topGeometry = createTopSurface(leftEdge, rightEdge);

  // 5단계: 아랫면 생성
  const bottomGeometry = createBottomSurface(leftEdge, rightEdge, thickness);

  // 6단계: 측면 생성
  const sideGeometry = createSideSurfaces(leftEdge, rightEdge, thickness);

  // 7단계: 모든 지오메트리 병합
  const geometries = [topGeometry, bottomGeometry, sideGeometry].filter(
    (g): g is THREE.BufferGeometry => g !== null
  );

  if (geometries.length === 0) {
    return null;
  }

  const mergedGeometry = mergeGeometries(geometries);
  return mergedGeometry;
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
 * 높이 프로필 적용 (삼각형 프로필: 선형 증가 → 선형 감소)
 */
function applyHeightProfile(
  pathPoints: THREE.Vector3[],
  minHeight: number,
  maxHeight: number,
  segments: number
): void {
  const midIndex = Math.floor(segments / 2);

  for (let i = 0; i < pathPoints.length; i++) {
    let heightFactor: number;

    if (i <= midIndex) {
      // 전반부: 0 → 1 (선형 증가)
      heightFactor = i / midIndex;
    } else {
      // 후반부: 1 → 0 (선형 감소)
      heightFactor = (segments - i) / (segments - midIndex);
    }

    const height = minHeight + (maxHeight - minHeight) * heightFactor;
    const currentRadius = pathPoints[i].length();
    pathPoints[i].multiplyScalar((currentRadius + height) / currentRadius);
  }
}

/**
 * 좌우 가장자리 생성
 */
function createEdges(
  pathPoints: THREE.Vector3[],
  minWidth: number,
  lineWidth: number
): { leftEdge: THREE.Vector3[]; rightEdge: THREE.Vector3[] } {
  const leftEdge: THREE.Vector3[] = [];
  const rightEdge: THREE.Vector3[] = [];

  for (let i = 0; i < pathPoints.length; i++) {
    const current = pathPoints[i];

    // 진행 방향 계산 (더 부드럽게)
    let tangent: THREE.Vector3;
    if (i === 0) {
      // 첫 점: 다음 점과의 방향
      tangent = pathPoints[1].clone().sub(current).normalize();
    } else if (i === pathPoints.length - 1) {
      // 마지막 점: 이전 점과의 방향
      tangent = current
        .clone()
        .sub(pathPoints[i - 1])
        .normalize();
    } else {
      // 중간 점: 이전과 다음의 평균 방향
      const prev = pathPoints[i - 1];
      const next = pathPoints[i + 1];
      tangent = next.clone().sub(prev).normalize();
    }

    // 반지름 방향
    const radial = current.clone().normalize();

    // 법선 방향 (좌우) - tangent와 radial에 수직
    const normal = new THREE.Vector3().crossVectors(tangent, radial).normalize();

    // 너비 계산 (선형 증가)
    const widthFactor = i / (pathPoints.length - 1);
    const width = minWidth + (lineWidth - minWidth) * widthFactor;
    const halfWidth = width / 2;

    // 좌우 점 생성
    leftEdge.push(current.clone().add(normal.clone().multiplyScalar(halfWidth)));
    rightEdge.push(current.clone().sub(normal.clone().multiplyScalar(halfWidth)));
  }

  return { leftEdge, rightEdge };
}

/**
 * 윗면 생성 (삼각분할)
 */
function createTopSurface(
  leftEdge: THREE.Vector3[],
  rightEdge: THREE.Vector3[]
): THREE.BufferGeometry | null {
  const vertices: number[] = [];
  const indices: number[] = [];

  // Triangle strip 방식으로 변경
  // leftEdge와 rightEdge를 따라 사각형(2개 삼각형)으로 연결

  // 모든 정점 추가
  for (let i = 0; i < leftEdge.length; i++) {
    vertices.push(leftEdge[i].x, leftEdge[i].y, leftEdge[i].z);
  }
  for (let i = 0; i < rightEdge.length; i++) {
    vertices.push(rightEdge[i].x, rightEdge[i].y, rightEdge[i].z);
  }

  const leftCount = leftEdge.length;
  const rightCount = rightEdge.length;

  // leftEdge를 따라 삼각형 생성
  for (let i = 0; i < leftCount - 1; i++) {
    const l1 = i;
    const l2 = i + 1;
    const r1 = leftCount + i;
    const r2 = leftCount + i + 1;

    // 사각형을 2개의 삼각형으로 분할
    indices.push(l1, l2, r1);
    indices.push(l2, r2, r1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * 아랫면 생성
 */
function createBottomSurface(
  leftEdge: THREE.Vector3[],
  rightEdge: THREE.Vector3[],
  thickness: number
): THREE.BufferGeometry | null {
  // 윗면 점들을 구면 안쪽으로 이동
  const bottomLeft = leftEdge.map((p) => p.clone().multiplyScalar(1 - thickness));
  const bottomRight = rightEdge.map((p) => p.clone().multiplyScalar(1 - thickness));

  return createTopSurface(bottomLeft, bottomRight);
}

/**
 * 측면 생성
 */
function createSideSurfaces(
  leftEdge: THREE.Vector3[],
  rightEdge: THREE.Vector3[],
  thickness: number
): THREE.BufferGeometry | null {
  const vertices: number[] = [];
  const indices: number[] = [];
  let vertexIndex = 0;

  const bottomLeft = leftEdge.map((p) => p.clone().multiplyScalar(1 - thickness));
  const bottomRight = rightEdge.map((p) => p.clone().multiplyScalar(1 - thickness));

  // 왼쪽 측면 (외부에서 봤을 때)
  for (let i = 0; i < leftEdge.length - 1; i++) {
    const tl = leftEdge[i];
    const tr = leftEdge[i + 1];
    const bl = bottomLeft[i];
    const br = bottomLeft[i + 1];

    vertices.push(tl.x, tl.y, tl.z);
    vertices.push(tr.x, tr.y, tr.z);
    vertices.push(bl.x, bl.y, bl.z);
    vertices.push(br.x, br.y, br.z);

    // 외부를 향하도록 삼각형 순서 조정
    indices.push(vertexIndex, vertexIndex + 2, vertexIndex + 1);
    indices.push(vertexIndex + 1, vertexIndex + 2, vertexIndex + 3);
    vertexIndex += 4;
  }

  // 오른쪽 측면 (외부에서 봤을 때)
  for (let i = 0; i < rightEdge.length - 1; i++) {
    const tl = rightEdge[i];
    const tr = rightEdge[i + 1];
    const bl = bottomRight[i];
    const br = bottomRight[i + 1];

    vertices.push(tl.x, tl.y, tl.z);
    vertices.push(tr.x, tr.y, tr.z);
    vertices.push(bl.x, bl.y, bl.z);
    vertices.push(br.x, br.y, br.z);

    // 외부를 향하도록 삼각형 순서 조정 (왼쪽과 반대)
    indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
    indices.push(vertexIndex + 1, vertexIndex + 3, vertexIndex + 2);
    vertexIndex += 4;
  }

  // 앞면 (시작 부분)
  const frontTL = leftEdge[0];
  const frontTR = rightEdge[0];
  const frontBL = bottomLeft[0];
  const frontBR = bottomRight[0];

  vertices.push(frontTL.x, frontTL.y, frontTL.z);
  vertices.push(frontTR.x, frontTR.y, frontTR.z);
  vertices.push(frontBL.x, frontBL.y, frontBL.z);
  vertices.push(frontBR.x, frontBR.y, frontBR.z);

  indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
  indices.push(vertexIndex + 1, vertexIndex + 3, vertexIndex + 2);
  vertexIndex += 4;

  // 뒷면 (끝 부분)
  const backIdx = leftEdge.length - 1;
  const backTL = leftEdge[backIdx];
  const backTR = rightEdge[backIdx];
  const backBL = bottomLeft[backIdx];
  const backBR = bottomRight[backIdx];

  vertices.push(backTL.x, backTL.y, backTL.z);
  vertices.push(backTR.x, backTR.y, backTR.z);
  vertices.push(backBL.x, backBL.y, backBL.z);
  vertices.push(backBR.x, backBR.y, backBR.z);

  indices.push(vertexIndex, vertexIndex + 2, vertexIndex + 1);
  indices.push(vertexIndex + 1, vertexIndex + 2, vertexIndex + 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}
