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
 */
export function RegionFeatureCollection({
  features,
  style,
  hoverStyle,
  extrusion = { color: Colors.GRAY[8] },
}: RegionFeatureCollectionProps) {
  // 스타일 병합 (기본값 + 사용자 지정)
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

  const mergedHoverStyle = useMemo(
    () => ({
      ...mergedStyle,
      lineWidth: UiConstant.polygonFeature.default.hoverStyle.lineWidth ?? mergedStyle.lineWidth,
      ...hoverStyle,
    }),
    [mergedStyle, hoverStyle]
  );

  // 지오메트리 병합
  const mergedGeometry = useMergedGeometry({
    features,
    enableExtrusion: !!extrusion,
  });

  // R-Tree에 배치 등록 (호버 감지용)
  useBatchRegionModels({ features });

  if (!mergedGeometry) return null;

  return (
    <group>
      {/* 병합된 상단 면 */}
      <mesh geometry={mergedGeometry.faceGeometry}>
        <meshBasicMaterial
          transparent
          side={THREE.DoubleSide}
          color={mergedStyle.fillColor}
          opacity={mergedStyle.fillOpacity}
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
        hoverStyle={mergedHoverStyle}
        extrusionColor={extrusion?.color}
      />
    </group>
  );
}
