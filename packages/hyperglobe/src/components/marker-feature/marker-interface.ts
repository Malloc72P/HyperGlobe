import { Coordinate } from '@hyperglobe/interfaces';

/**
 * 마커 데이터
 */
export interface MarkerData {
  /** 마커 위치 (경도, 위도) */
  position: Coordinate;

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

  /** 마커 fill 색상 */
  fill?: string;

  /** 마커 stroke 색상 */
  stroke?: string;

  /** 마커 크기 배율 */
  scale?: number;

  /** 사용자 정의 데이터 */
  data?: any;
}
