/**
 * Feature의 스타일.
 *
 * - 외곽선, 면 채우기 등의 스타일 속성을 정의합니다.
 */
export interface FeatureStyle {
  /**
   * 선 색상
   */
  color?: string;

  /**
   * 선 두께
   */
  lineWidth?: number;

  /**
   * 면 색상
   */
  fillColor?: string;

  /**
   * 면 투명도 (0~1)
   */
  fillOpacity?: number;
}
