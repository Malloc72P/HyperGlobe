import type { Coordinate, HGM, RegionModel } from '@hyperglobe/interfaces';
import type { CSSProperties, ReactNode } from 'react';
import type { ColorScaleModel } from './colorscale';
import type { FeatureStyle } from './feature';

// ============================================================================
// 캔버스/컨테이너 설정
// ============================================================================

/**
 * HyperGlobe 컴포넌트의 기본 설정
 */
export interface HyperGlobeBaseProps {
  /**
   * Canvas 요소의 id 속성
   */
  id?: string;

  /**
   * 지구본의 크기
   * @default '100%'
   */
  size?: number | string;

  /**
   * 지구본의 최대 크기
   */
  maxSize?: number | string;

  /**
   * Canvas 요소에 적용할 스타일 객체
   */
  style?: CSSProperties;
}

// ============================================================================
// 지구본 설정
// ============================================================================

/**
 * 지구본(Globe) 스타일 설정
 */
export interface GlobeStyleConfig {
  /**
   * 구체 색상
   * @default '#0077be'
   */
  color?: string;

  /**
   * 재질의 거칠기 (0: 매끄러움, 1: 거침)
   * @default 0.5
   */
  roughness?: number;

  /**
   * 재질의 금속성 (0: 비금속, 1: 금속)
   * @default 0
   */
  metalness?: number;
}

/**
 * 지구본 설정
 */
export interface GlobeConfig {
  /**
   * 지구본 스타일
   */
  style?: GlobeStyleConfig;

  /**
   * 와이어프레임 표시 여부
   * @default false
   */
  wireframe?: boolean;

  /**
   * 구체의 세그먼트 수 [가로, 세로]
   * @default [64, 32]
   */
  segments?: [number, number];
}

// ============================================================================
// 카메라 설정
// ============================================================================

/**
 * 카메라 설정
 */
export interface CameraConfig {
  /**
   * 카메라 초기 위치 (경도, 위도)
   * @default [0, 0]
   */
  initialPosition?: Coordinate;

  /**
   * 카메라 시야각 (Field of View)
   * @default 25
   */
  fov?: number;

  /**
   * 카메라 최소 거리
   * @default 1.5
   */
  minDistance?: number;

  /**
   * 카메라 최대 거리
   * @default 10
   */
  maxDistance?: number;
}

// ============================================================================
// 컨트롤 설정
// ============================================================================

/**
 * 카메라 컨트롤 설정
 */
export interface ControlsConfig {
  /**
   * 줌 활성화 여부
   * @default true
   */
  enableZoom?: boolean;

  /**
   * 회전 활성화 여부
   * @default true
   */
  enableRotate?: boolean;

  /**
   * 팬(이동) 활성화 여부
   * @default false
   */
  enablePan?: boolean;
}

// ============================================================================
// Region 피처 설정
// ============================================================================

/**
 * Region 피처 설정
 */
export interface RegionConfig {
  /**
   * 기본 스타일
   */
  style?: FeatureStyle;

  /**
   * 호버 시 적용될 스타일
   */
  hoverStyle?: FeatureStyle;

  /**
   * dataMap에서 사용할 데이터 키
   *
   * - 이 키에 해당하는 데이터가 컬러스케일에 적용됩니다.
   */
  dataKey?: string;

  /**
   * 피쳐의 id로 사용할 속성 이름
   *
   * - dataMap의 데이터와 매핑할 때 사용됩니다.
   * - 예: 'ISO_A2', 'ISO_A3'
   */
  idField?: string;

  /**
   * 측면(extrusion) 옵션
   */
  extrusion?: {
    /**
     * 측면 색상
     */
    color?: string;
  };
}

// ============================================================================
// Graticule 설정
// ============================================================================

/**
 * 경위선 격자(Graticule) 설정
 */
export interface GraticuleConfig {
  /**
   * 경선 간격 (도 단위)
   * @default 10
   */
  longitudeStep?: number;

  /**
   * 위선 간격 (도 단위)
   * @default 10
   */
  latitudeStep?: number;

  /**
   * 격자선 색상
   * @default '#808080'
   */
  lineColor?: string;

  /**
   * 격자선 두께
   * @default 1.2
   */
  lineWidth?: number;
}

// ============================================================================
// Colorscale 설정
// ============================================================================

/**
 * 컬러스케일 설정
 *
 * - 외부에서 useColorScale 훅으로 생성한 ColorScaleModel을 전달합니다.
 */
export interface ColorscaleConfig {
  /**
   * 컬러스케일 모델
   *
   * - useColorScale 훅으로 생성합니다.
   */
  model: ColorScaleModel;

  /**
   * dataMap에서 사용할 데이터 키
   *
   * - region.dataKey와 동일하게 설정하면 됩니다.
   */
  dataKey?: string;
}

// ============================================================================
// ColorscaleBar 설정
// ============================================================================

/**
 * 컬러스케일 바 위치
 */
export type ColorscaleBarPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * 컬러스케일 바 설정
 */
export interface ColorscaleBarConfig {
  /**
   * 표시 여부
   * @default true (colorscaleBar prop이 존재하면)
   */
  show?: boolean;

  /**
   * 위치
   * @default 'bottom-right'
   */
  position?: ColorscaleBarPosition;

  /**
   * 제목
   */
  title?: string;

  /**
   * 스타일
   */
  style?: CSSProperties;

  /**
   * 레이블 포맷터 함수
   */
  formatLabel?: (value: number) => string;
}

// ============================================================================
// Tooltip 설정
// ============================================================================

/**
 * 툴팁 설정
 */
export interface TooltipConfig {
  /**
   * 표시 여부
   * @default true (tooltip prop이 존재하면)
   */
  show?: boolean;

  /**
   * 툴팁 스타일
   */
  style?: CSSProperties;

  /**
   * 툴팁과 마우스 커서 사이의 거리 (픽셀)
   * @default 10
   */
  distance?: number;

  /**
   * 툴팁 텍스트 또는 텍스트 생성 함수
   */
  text?: string | ((model: RegionModel) => string);
}

// ============================================================================
// 이벤트 핸들러
// ============================================================================

/**
 * 호버 변경 이벤트 핸들러 파라미터
 */
export interface HoverChangedEventParam {
  /**
   * 호버된 지역 정보 (없으면 null)
   */
  hoveredRegion: RegionModel | null;
}

/**
 * 호버 변경 이벤트 핸들러
 */
export type OnHoverChangedHandler = (param: HoverChangedEventParam) => void;

// ============================================================================
// HyperGlobe Props
// ============================================================================

/**
 * HyperGlobe 컴포넌트의 Props
 */
export interface HyperGlobeProps extends HyperGlobeBaseProps {
  // === 필수 ===

  /**
   * HGM 데이터
   *
   * - null이면 로딩 상태로 간주됩니다.
   * - useHGM 훅으로 Blob 데이터를 HGM 객체로 변환할 수 있습니다.
   */
  hgm: HGM | null;

  // === 데이터 ===

  /**
   * 피처에 연결할 데이터 맵
   *
   * - 키: 데이터 식별자 (예: 'gdp', 'population')
   * - 값: Record<featureId, number> 형태의 데이터
   *
   * @example
   * ```tsx
   * dataMap={{
   *   gdp: { KOR: 1800000, JPN: 4900000, USA: 25000000 },
   *   population: { KOR: 51780000, JPN: 125800000, USA: 331000000 }
   * }}
   * ```
   */
  dataMap?: Record<string, any>;

  // === 지구본 ===

  /**
   * 지구본 설정
   */
  globe?: GlobeConfig;

  // === 카메라 ===

  /**
   * 카메라 설정
   */
  camera?: CameraConfig;

  // === 컨트롤 ===

  /**
   * 카메라 컨트롤 설정
   */
  controls?: ControlsConfig;

  // === 피처 ===

  /**
   * Region 피처 설정
   *
   * - 설정하면 HGM의 features를 기반으로 지역 폴리곤을 렌더링합니다.
   */
  region?: RegionConfig;

  /**
   * 경위선 격자 설정
   *
   * - 설정하면 경위선 격자를 표시합니다.
   * - true를 전달하면 기본값으로 표시합니다.
   */
  graticule?: GraticuleConfig | boolean;

  // === UI ===

  /**
   * 컬러스케일 설정
   */
  colorscale?: ColorscaleConfig;

  /**
   * 컬러스케일 바 설정
   *
   * - 설정하면 컬러스케일 바를 표시합니다.
   * - true를 전달하면 기본값으로 표시합니다.
   */
  colorscaleBar?: ColorscaleBarConfig | boolean;

  /**
   * 툴팁 설정
   *
   * - 설정하면 호버 시 툴팁을 표시합니다.
   * - true를 전달하면 기본값으로 표시합니다.
   */
  tooltip?: TooltipConfig | boolean;

  /**
   * FPS 카운터 표시 여부
   * @default false
   */
  showFpsCounter?: boolean;

  /**
   * 내장 로딩 UI 표시 여부
   *
   * - true: hgm이 null일 때 내장 로딩 UI 표시
   * - false: 로딩 UI를 표시하지 않음 (사용자가 외부에서 처리)
   *
   * @default true
   */
  showLoadingUI?: boolean;

  // === 이벤트 ===

  /**
   * 렌더링 완료 시 호출되는 콜백
   *
   * - 최초 1회만 호출됩니다.
   * - hgm이 로드되고 모든 피처가 렌더링 완료된 후 호출됩니다.
   */
  onReady?: () => void;

  /**
   * 호버된 지역이 변경될 때 호출되는 콜백
   */
  onHoverChanged?: OnHoverChangedHandler;
}
