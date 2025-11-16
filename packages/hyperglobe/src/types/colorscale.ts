import type { FeatureStyle } from './feature';

export interface ColorScaleModel {
  /**
   * 값이 null인 경우 적용될 스타일
   */
  nullStyle?: FeatureStyle;
  /**
   * 컬러스케일 구간 목록
   */
  steps: ColorScaleStepModel[];
}

export interface ColorScaleStepModel {
  /**
   * 컬러스케일 구간의 고유 아이디
   */
  id: string;
  /**
   * 전체 스텝 개수
   */
  stepTotal: number;
  /**
   * 스텝의 순서
   */
  index: number;
  /**
   * 컬러스케일 구간의 라벨
   */
  label: string;
  /**
   * 컬러스케일 구간의 최솟값
   *
   * - 구간은 from을 포함합니다.(from 이상)
   * - 생략하는 경우 음의 무한대를 의미합니다.
   */
  from: number;
  /**
   * 컬러스케일 구간의 상한.
   *
   * - 구간은 to를 포함하지 않습니다.(to 미만)
   * - 생략하는 경우 양의 무한대를 의미합니다.
   */
  to: number;
  /**
   * 구간에 적용될 스타일
   */
  style?: FeatureStyle;
  /**
   * 구간에 적용될 호버 스타일
   */
  hoverStyle?: FeatureStyle;
}
