import type { Coordinate, RegionModel } from '@hyperglobe/interfaces';
import type { CSSProperties, ReactNode } from 'react';
import type { ColorScaleModel } from './colorscale';
import type { FeatureStyle } from './feature';
import type { SvgStyle } from './svg';
import { MarkerData } from 'src/components/marker-feature/marker-interface';
import type { FeatureTransitionConfig } from './transition';
import { ColorScaleOptions } from 'src/hooks/use-colorscale';

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
   * 카메라 최소 거리
   *
   * - 1.5보다 작게 설정할 수 없습니다.
   *
   * @default 1.5
   */
  minDistance?: number;

  /**
   * 카메라 최대 거리
   *
   * - 10보다 크게 설정할 수 없습니다.
   *
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
   * dataMap에서 사용할 데이터
   *
   * dataMap에서 { myData: [...] } 형태로 데이터를 전달한 경우,
   * dataKey를 'myData'로 설정하면, 해당 데이터를 피쳐에 매핑합니다.
   *
   * 피쳐에 매핑할 때, 기본적으로 피쳐의 id 속성과 데이터 항목의 id 속성을 비교합니다.
   * 만약 피쳐와 데이터 항목의 id 속성 이름이 다르다면, 각각 idField, dataIdField를 사용할 수 있습니다.
   */
  dataKey?: string;

  /**
   * 리젼 피쳐의 id로 사용할 속성 이름
   */
  idField?: string;

  /**
   * 데이터의 아이디로 사용할 속성 이름
   */
  dataIdField?: string;

  /**
   * 측면(extrusion) 옵션
   */
  extrusion?: {
    /**
     * 측면 색상
     */
    color?: string;
  };

  /**
   * 페이드 인 트랜지션 설정
   *
   * - features가 로드될 때 스르륵 나타나는 효과를 적용합니다.
   * - 기본값: { enabled: true, duration: 500, easing: 'ease-out' }
   */
  transition?: FeatureTransitionConfig;
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

  /**
   * 페이드 인 트랜지션 설정
   *
   * - 경위선이 로드될 때 서서히 나타나는 효과를 적용합니다.
   */
  transition?: FeatureTransitionConfig;
}

// ============================================================================
// Route 설정
// ============================================================================

/**
 * 라우트의 시작/끝 지점 정보
 */
export interface RoutePointConfig {
  /**
   * 좌표 (경도, 위도)
   */
  coordinate: Coordinate;

  /**
   * 라벨 텍스트 (설정하면 마커가 표시됨)
   */
  label?: string;

  /**
   * 마커 스타일
   */
  style?: SvgStyle;
}

/**
 * 개별 라우트 설정
 */
export interface RouteConfig {
  /**
   * 라우트 식별자 (React key로 사용)
   */
  id: string;

  /**
   * 시작점 정보
   */
  from: RoutePointConfig;

  /**
   * 끝점 정보
   */
  to: RoutePointConfig;

  /**
   * 최대 높이 (중간점의 지구 표면으로부터의 높이)
   */
  maxHeight: number;

  /**
   * 선 너비
   */
  lineWidth: number;

  /**
   * 경로 보간 개수
   * @default 500
   */
  segments?: number;

  /**
   * 스타일
   */
  style?: FeatureStyle;

  /**
   * 애니메이션 활성화 여부
   * @default true
   */
  animated?: boolean;

  /**
   * 애니메이션 지속 시간 (밀리초)
   * @default 1000
   */
  animationDuration?: number;

  /**
   * 애니메이션 시작 딜레이 (밀리초)
   * @default 0
   */
  animationDelay?: number;

  /**
   * 도형 크기 스케일
   * @default 1
   */
  objectScale?: number;
}

// ============================================================================
// Marker 설정
// ============================================================================

/**
 * 마커 전체 설정
 */
export interface MarkerConfig {
  /**
   * 마커 목록
   */
  items: MarkerData[];

  /**
   * 기본 스케일
   * @default 1
   */
  defaultScale?: number;

  /**
   * 라벨 표시 여부
   * @default true
   */
  showLabels?: boolean;

  /**
   * 마커 클릭 핸들러
   */
  onMarkerClick?: (marker: MarkerData) => void;
}

// ============================================================================
// Colorscale 설정
// ============================================================================

/**
 * 컬러스케일 설정
 *
 * - 외부에서 useColorScale 훅으로 생성한 ColorScaleModel을 전달합니다.
 */
export interface ColorscaleConfig extends Omit<ColorScaleOptions, 'data'> {
  /**
   * 컬러스케일 바 설정
   */
  colorscaleBar?: ColorscaleBarConfig | boolean;
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
   * HGM 파일 URL
   *
   * - HyperGlobe 내부에서 자동으로 fetch하여 로드합니다.
   * - 로딩 중에는 내장 로딩 UI가 표시됩니다.
   *
   * @example
   * ```tsx
   * <HyperGlobe hgmUrl="https://unpkg.com/@malloc72p/hyperglobe-maps/dist/world.hgm" ... />
   * ```
   */
  hgmUrl: string;

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

  /**
   * 라우트(비행경로) 설정
   *
   * - 두 지점 사이의 대권항로를 곡선으로 표시합니다.
   */
  routes?: RouteConfig[];

  /**
   * 마커 설정
   *
   * - 지구본 위에 마커를 표시합니다.
   */
  marker?: MarkerConfig;

  // === UI ===

  /**
   * 컬러스케일 설정
   */
  colorscale?: ColorscaleConfig;

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

  /**
   * 지연 로딩(Lazy Loading) 활성화 여부
   *
   * - true: 컴포넌트가 뷰포트에 들어왔을 때만 HGM 파일을 로드하고 렌더링 시작
   * - false: 컴포넌트가 마운트되는 즉시 로드 및 렌더링
   *
   * @default true
   */
  lazyLoad?: boolean;

  /**
   * 지연 로딩 감지 임계값 (0.0 ~ 1.0)
   *
   * - 컴포넌트가 뷰포트에 얼마나 보일 때 로드를 시작할지 설정
   * - 0.1 = 컴포넌트의 10%가 보이면 로드 시작
   * - 1.0 = 컴포넌트가 완전히 보여야 로드 시작
   *
   * @default 0.1
   */
  lazyLoadThreshold?: number;

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
