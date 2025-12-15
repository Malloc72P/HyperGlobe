import { Coordinate } from '@hyperglobe/interfaces';
import { FeatureTransitionConfig } from 'src/types';
import { SvgStyle } from 'src/types/svg';

/**
 * 마커 데이터
 */
export interface MarkerData {
  /** 마커 아이디 */
  id: string;

  /** 마커 위치 (경도, 위도) */
  coordinate: Coordinate;

  /**
   * SVG path 문자열
   *
   * - 마커의 모양을 설정합니다.
   * - pin, circle, custom 중 하나를 선택할 수 있습니다.
   * - custom을 선택하면 iconPath 속성을 통해 사용자 정의 SVG path를 지정할 수 있습니다.
   *
   * @default 'pin'
   */
  icon?: 'pin' | 'circle' | 'custom';

  /** 사용자 정의 아이콘. icon이 custom인 경우에 적용됩니다.  */
  iconPath?: string;

  /** 마커 라벨 텍스트 */
  label?: string;

  /** 마커 스타일 */
  style?: SvgStyle;

  /** 마커 크기 배율 */
  scale?: number;

  /** 사용자 정의 데이터 */
  data?: any;

  /** 마커 라벨 표시 여부 */
  showLabels?: boolean;

  /** 마커 클릭 이벤트 핸들러 */
  onMarkerClick?: (marker: MarkerData) => void;

  /**
   * 페이드 인 트랜지션 설정
   *
   * - features가 로드될 때 스르륵 나타나는 효과를 적용합니다.
   * - 기본값: { enabled: true, duration: 500, easing: 'ease-out' }
   */
  transition?: FeatureTransitionConfig;
}
