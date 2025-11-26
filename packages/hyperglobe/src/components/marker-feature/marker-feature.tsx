import { MarkerData } from './marker';
import { Marker } from './marker';

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
