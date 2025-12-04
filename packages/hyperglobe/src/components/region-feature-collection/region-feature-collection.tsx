import type { HGMFeature } from '@hyperglobe/interfaces';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { UiConstant } from '../../constants';
import { Colors } from '../../lib';
import type { FeatureStyle } from '../../types/feature';
import { useMergedGeometry } from './use-merged-geometry';
import { useBatchRegionModels } from './use-batch-region-models';
import { HoveredRegionOverlay } from './hovered-region-overlay';
import { ColorScaleModel } from '../../types';

export interface RegionFeatureCollectionProps {
  /**
   * 렌더링할 features 배열
   */
  features: HGMFeature[];

  /**
   * 기본 스타일
   */
  style?: FeatureStyle;

  /**
   * 호버 시 적용될 스타일
   */
  hoverStyle?: FeatureStyle;

  /**
   * 피쳐 컬렉션에 연결할 추가 데이터
   *
   * - 컬러스케일 적용에 사용됩니다.
   * - 기본적으로 피쳐의 id와 매핑됩니다.
   * - 만약 피쳐의 특정 속성(properties)의 값을 키로 사용하고 싶다면, `idField` prop을 사용하세요.
   *
   * @example
   * ```tsx
   * // Feature의 id 속성 사용(기본값)
   * data={{ KOR: 51780000, JPN: 125800000 }}
   *
   * // isoA2 속성을 키로 사용하는 경우(idField 지정)
   * data={{ KR: 51780000, JP: 125800000 }}
   * idField="isoA2"
   * ```
   */
  data?: Record<string, number>;

  /**
   * 피쳐의 id로 사용할 속성 이름
   *
   * - `data` prop과 매핑할 때 사용됩니다.
   * - 예: 'iso-a2'
   */
  idField?: string;

  /**
   * 피쳐의 값(value)으로 사용할 속성 이름
   *
   * - `data` prop과 매핑할 때 사용됩니다.
   * - 예: 'population'
   * @default 'value'
   */
  valueField?: string;

  /**
   * 컬러스케일.
   *
   * - 컬러스케일이 설정되면, 피쳐는 컬러스케일에 따라 색상이 결정됩니다.
   * - style보다 우선 적용됩니다.
   * - 주로 데이터 시각화에 사용됩니다.
   */
  colorscale?: ColorScaleModel;

  /**
   * 측면(extrusion) 옵션
   */
  extrusion?: {
    /**
     * 측면 색상 (기본값: Colors.GRAY[8])
     */
    color?: string;
  };
}

/**
 * 여러 RegionFeature를 최적화하여 렌더링하는 컴포넌트
 *
 * ### 최적화 방식
 * - 모든 features의 지오메트리를 하나로 병합하여 드로우콜 최소화
 * - 호버된 feature만 별도 오버레이로 렌더링
 *
 * ### 드로우콜 비교
 * - 기존 방식: 국가 수 × 3 (상단면, 측면, 외곽선) ≈ 600 드로우콜
 * - 최적화 후: 3 (병합 메시) + 3 (호버 오버레이) ≈ 6 드로우콜
 *
 * @example
 * ```tsx
 * <RegionFeatureCollection
 *   features={hgm.features}
 *   style={{ fillColor: 'blue', color: 'darkblue', lineWidth: 1 }}
 *   hoverStyle={{ fillColor: 'lightblue', lineWidth: 2 }}
 *   extrusion={{ color: 'navy' }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // ColorScale 사용 예시
 * <RegionFeatureCollection
 *   features={hgm.features}
 *   colorscale={colorscale}
 *   data={{ KOR: 51780000, JPN: 125800000, CHN: 1412000000 }}
 *   idField="ISO_A3"
 * />
 * ```
 */
export function RegionFeatureCollection({
  features,
  style,
  hoverStyle,
  colorscale,
  data,
  idField,
  valueField = 'value',
  extrusion = { color: Colors.GRAY[8] },
}: RegionFeatureCollectionProps) {
  /** 스타일 병합 (기본값 + 사용자 지정) */
  const mergedStyle = useMemo(
    () => ({
      color: UiConstant.polygonFeature.default.style.color!,
      lineWidth: UiConstant.polygonFeature.default.style.lineWidth!,
      fillColor: UiConstant.polygonFeature.default.style.fillColor!,
      fillOpacity: UiConstant.polygonFeature.default.style.fillOpacity!,
      ...style,
    }),
    [style]
  );

  /** 병합된 지오메트리에 대한 호버 스타일 */
  const mergedHoverStyle = useMemo(
    () => ({
      ...mergedStyle,
      lineWidth: UiConstant.polygonFeature.default.hoverStyle.lineWidth ?? mergedStyle.lineWidth,
      ...hoverStyle,
    }),
    [mergedStyle, hoverStyle]
  );

  /** 지오메트리 병합 (colorscale + data 전달) */
  const mergedGeometry = useMergedGeometry({
    features,
    enableExtrusion: !!extrusion,
    style: mergedStyle,
    colorscale,
    data,
    idField,
    valueField,
  });

  /** R-Tree에 배치 등록 (호버 감지용) */
  useBatchRegionModels({ features, data, idField });

  if (!mergedGeometry) return null;

  return (
    <group>
      {/* 병합된 상단 면 */}
      <mesh geometry={mergedGeometry.faceGeometry}>
        <meshBasicMaterial
          transparent
          side={THREE.DoubleSide}
          color={mergedGeometry.useVertexColors ? 'white' : mergedStyle.fillColor}
          opacity={mergedStyle.fillOpacity}
          vertexColors={mergedGeometry.useVertexColors}
        />
      </mesh>

      {/* 병합된 측면 */}
      {mergedGeometry.sideGeometry && (
        <mesh geometry={mergedGeometry.sideGeometry}>
          <meshBasicMaterial
            transparent
            side={THREE.DoubleSide}
            color={extrusion?.color ?? Colors.GRAY[8]}
            opacity={1}
          />
        </mesh>
      )}

      {/* 병합된 외곽선 */}
      <Line
        points={mergedGeometry.borderPoints}
        segments
        color={mergedStyle.color}
        lineWidth={mergedStyle.lineWidth}
      />

      {/* 호버 오버레이 */}
      <HoveredRegionOverlay
        features={features}
        style={mergedStyle}
        hoverStyle={mergedHoverStyle}
        colorscale={colorscale}
        data={data}
        idField={idField}
        extrusionColor={extrusion?.color}
      />
    </group>
  );
}
