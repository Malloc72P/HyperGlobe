import type { HGMFeature } from '@hyperglobe/interfaces';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useMainStore } from '../../store/main-store';
import { createFeatureGeometry } from './use-merged-geometry';
import type { FeatureStyle } from '../../types/feature';
import { Colors } from '../../lib';

export interface HoveredRegionOverlayProps {
  /** 모든 features (호버된 feature를 찾기 위해 필요) */
  features: HGMFeature[];
  /** 호버 시 적용될 스타일 */
  hoverStyle: Required<FeatureStyle>;
  /** extrusion 색상 */
  extrusionColor?: string;
}

interface HoveredGeometry {
  faceGeometry: THREE.BufferGeometry;
  sideGeometry: THREE.BufferGeometry;
  borderPoints: number[];
}

/**
 * 호버된 region만 별도로 렌더링하는 오버레이 컴포넌트
 *
 * - 호버된 region이 있을 때만 렌더링
 * - polygonOffset으로 Z-fighting 방지
 */
export function HoveredRegionOverlay({
  features,
  hoverStyle,
  extrusionColor = Colors.GRAY[8],
}: HoveredRegionOverlayProps) {
  // 호버된 region ID 구독
  const hoveredRegionId = useMainStore((s) => s.hoveredRegion?.id ?? null);

  // 이전 지오메트리 참조 (메모리 해제용)
  const prevGeometryRef = useRef<HoveredGeometry | null>(null);

  // 호버된 feature 찾기
  const hoveredFeature = useMemo(() => {
    if (!hoveredRegionId) return null;
    return features.find((f) => f.id === hoveredRegionId) ?? null;
  }, [features, hoveredRegionId]);

  // 호버된 feature의 지오메트리 생성
  const hoveredGeometry = useMemo(() => {
    if (!hoveredFeature) return null;
    return createFeatureGeometry(hoveredFeature);
  }, [hoveredFeature]);

  // 이전 지오메트리 정리 (메모리 누수 방지)
  useEffect(() => {
    const prevGeometry = prevGeometryRef.current;

    // 새 지오메트리로 교체 시 이전 것 정리
    if (prevGeometry && prevGeometry !== hoveredGeometry) {
      prevGeometry.faceGeometry.dispose();
      prevGeometry.sideGeometry.dispose();
    }

    prevGeometryRef.current = hoveredGeometry;

    // 언마운트 시 정리
    return () => {
      if (prevGeometryRef.current) {
        prevGeometryRef.current.faceGeometry.dispose();
        prevGeometryRef.current.sideGeometry.dispose();
      }
    };
  }, [hoveredGeometry]);

  if (!hoveredFeature || !hoveredGeometry) return null;

  return (
    <group>
      {/* 상단 면 (호버 스타일) */}
      <mesh geometry={hoveredGeometry.faceGeometry}>
        <meshBasicMaterial
          transparent
          side={THREE.DoubleSide}
          color={hoverStyle.fillColor}
          opacity={hoverStyle.fillOpacity}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* 측면 (호버 스타일) */}
      <mesh geometry={hoveredGeometry.sideGeometry}>
        <meshBasicMaterial
          transparent
          side={THREE.DoubleSide}
          color={extrusionColor}
          opacity={1}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* 외곽선 (호버 스타일) */}
      <Line
        points={hoveredGeometry.borderPoints}
        segments
        color={hoverStyle.color}
        lineWidth={hoverStyle.lineWidth}
      />
    </group>
  );
}
