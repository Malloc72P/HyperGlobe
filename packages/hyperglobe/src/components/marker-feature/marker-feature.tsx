import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { OrthographicProj } from '@hyperglobe/tools';
import type { Coordinate } from '@hyperglobe/interfaces';
import * as THREE from 'three';

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
  const position = useMemo(() => {
    const coords = OrthographicProj.project(marker.position, 1);
    return new THREE.Vector3(coords[0], coords[1], coords[2]);
  }, [marker.position]);

  const color = marker.color || defaultColor;
  const scale = marker.scale || defaultScale;
  const iconSize = 24 * scale;

  // 기본 아이콘 (원형 마커)
  const defaultIcon = `M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`;

  return (
    <group position={position}>
      <Html
        center
        distanceFactor={0.3}
        occlude
        style={{
          pointerEvents: 'auto',
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
            <path d={marker.icon || defaultIcon} fill={color} />
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
