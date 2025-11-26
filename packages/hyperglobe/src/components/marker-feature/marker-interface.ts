import { Coordinate } from '@hyperglobe/interfaces';

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

  /** 마커 fill 색상 */
  fill?: string;

  /** 마커 stroke 색상 */
  stroke?: string;

  /** 마커 크기 배율 */
  scale?: number;

  /** 사용자 정의 데이터 */
  data?: any;
}
