import { useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { OrthographicProj } from '@hyperglobe/tools';
import type { Coordinate } from '@hyperglobe/interfaces';
import * as THREE from 'three';
import { UiConstant } from 'src/constants';

/**
 * 마커 데이터
 */
export interface MarkerData {
  /** 마커 위치 (경도, 위도) */
  position: Coordinate;

  /** SVG path 문자열 (선택사항) */
  icon?: string;

  /** 마커 라벨 텍스트 */
  label?: string;

  /** 마커 색상 */
  color?: string;

  /** 마커 크기 배율 */
  scale?: number;

  /** 사용자 정의 데이터 */
  data?: any;
}

/**
 * MarkerFeature Props
 */
export interface MarkerFeatureProps {
  /** 표시할 마커 배열 */
  markers: MarkerData[];

  /** 기본 마커 색상 */
  defaultColor?: string;

  /** 기본 마커 크기 */
  defaultScale?: number;

  /** 라벨 표시 여부 */
  showLabels?: boolean;

  /** 마커 클릭 이벤트 핸들러 */
  onMarkerClick?: (marker: MarkerData) => void;

  /** 마커 호버 이벤트 핸들러 */
  onMarkerHover?: (marker: MarkerData | null) => void;
}

// 기본 아이콘 (원형 마커) - 컴포넌트 외부로 이동하여 재생성 방지
const DEFAULT_ICON = `M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`;

/**
 * 단일 마커 컴포넌트
 */
function Marker({
  marker,
  defaultColor = '#ff5722',
  defaultScale = 1,
  showLabels = true,
  onMarkerClick,
  onMarkerHover,
}: {
  marker: MarkerData;
  defaultColor: string;
  defaultScale: number;
  showLabels: boolean;
  onMarkerClick?: (marker: MarkerData) => void;
  onMarkerHover?: (marker: MarkerData | null) => void;
}) {
  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(true);

  const position = useMemo(() => {
    const coords = OrthographicProj.project(marker.position, 1);
    return new THREE.Vector3(coords[0], coords[1], coords[2]);
  }, [marker.position]);

  // 매 프레임마다 마커의 가시성 체크
  useFrame(() => {
    // 마커 방향 벡터 (원점 → 마커, 회전 적용 전 로컬 좌표)
    const markerDir = position.clone().normalize();

    // Globe의 Y축 회전을 마커 벡터에 적용
    // group rotation을 적용하여 월드 좌표계로 변환
    const rotationEuler = new THREE.Euler(...UiConstant.globe.rotation);
    markerDir.applyEuler(rotationEuler);

    // 카메라 방향 벡터 (원점 → 카메라, 이미 월드 좌표계)
    const cameraDir = camera.position.clone().normalize();

    // 내적 계산: 두 벡터가 이루는 각도의 코사인 값
    const dotProduct = markerDir.dot(cameraDir);

    // 내적 > 0: 각도 < 90도 → 같은 반구 (보임)
    // 내적 ≤ 0: 각도 ≥ 90도 → 반대 반구 (숨김)
    // 0.1을 임계값으로 사용하여 경계에서 깜빡임 방지
    setIsVisible(dotProduct > 0.1);
  });

  const color = marker.color || defaultColor;
  const scale = marker.scale || defaultScale;
  const iconSize = 24 * scale;

  // 마커가 지구 뒤편에 있으면 렌더링하지 않음
  if (!isVisible) {
    return null;
  }

  return (
    <group position={position}>
      <Html
        center
        style={{
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            cursor: onMarkerClick ? 'pointer' : 'default',
            userSelect: 'none',
          }}
          onClick={() => onMarkerClick?.(marker)}
          onMouseEnter={() => onMarkerHover?.(marker)}
          onMouseLeave={() => onMarkerHover?.(null)}
        >
          {/* SVG 아이콘 */}
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            <path d={marker.icon || DEFAULT_ICON} fill={color} />
          </svg>

          {/* 라벨 */}
          {showLabels && marker.label && (
            <div
              style={{
                fontSize: `${12 * scale}px`,
                fontWeight: 'bold',
                color: 'white',
                background: 'rgba(0,0,0,0.8)',
                padding: `${4 * scale}px ${8 * scale}px`,
                borderRadius: `${4 * scale}px`,
                marginTop: `${4 * scale}px`,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {marker.label}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

/**
 * **MarkerFeature 컴포넌트**
 *
 * 지구본 위에 소수의 중요 지점을 마커와 라벨로 표시합니다.
 *
 * ### 특징
 * - SVG 아이콘 지원
 * - 텍스트 라벨 표시
 * - 자동 Billboard (항상 카메라를 향함)
 * - 지구 반대편에서 자동으로 가려짐
 * - 클릭/호버 이벤트 지원
 *
 * ### 적합한 사용 사례
 * - 주요 도시, 랜드마크 표시
 * - 50개 이하의 중요 지점
 * - 라벨이 필요한 경우
 *
 * ### import
 * ```
 * import { MarkerFeature } from 'hyperglobe';
 * ```
 *
 * @example
 * ```tsx
 * <HyperGlobe>
 *   <MarkerFeature
 *     markers={[
 *       { position: [126.978, 37.5665], label: '서울', color: '#ff0000' },
 *       { position: [-0.1278, 51.5074], label: '런던', color: '#0000ff' },
 *     ]}
 *   />
 * </HyperGlobe>
 * ```
 */
export function MarkerFeature({
  markers,
  defaultColor = '#ff5722',
  defaultScale = 1,
  showLabels = true,
  onMarkerClick,
  onMarkerHover,
}: MarkerFeatureProps) {
  return (
    <>
      {markers.map((marker, index) => (
        <Marker
          key={index}
          marker={marker}
          defaultColor={defaultColor}
          defaultScale={defaultScale}
          showLabels={showLabels}
          onMarkerClick={onMarkerClick}
          onMarkerHover={onMarkerHover}
        />
      ))}
    </>
  );
}
