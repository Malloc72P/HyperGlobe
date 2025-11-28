import { OrthographicProj } from '@hyperglobe/tools';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import { UiConstant } from 'src/constants';
import * as THREE from 'three';
import { MarkerData } from './marker-interface';
import { useMarkerShape } from './use-marker-shape';
import { useSvgStyle } from 'src/hooks/use-svg-style';

export interface MarkerFeatureProps extends MarkerData {
  defaultScale?: number;
  showLabels?: boolean;
  onMarkerClick?: (marker: MarkerData) => void;
  onMarkerHover?: (marker: MarkerData | null) => void;
}

/**
 * 마커 컴포넌트
 */
export function MarkerFeature({
  coordinate,
  icon,
  iconPath,
  label,
  style,
  scale: _scale,
  defaultScale = 1,
  showLabels = true,
  onMarkerClick,
}: MarkerFeatureProps) {
  const { camera } = useThree();
  const [isVisible, setIsVisible] = useState(true);
  const [iconShape] = useMarkerShape({ icon, iconPath });
  const [appliedStyle] = useSvgStyle({ style });

  const position = useMemo(() => {
    const coords = OrthographicProj.project(coordinate, 1);
    return new THREE.Vector3(coords[0], coords[1], coords[2]);
  }, [coordinate]);

  // 매 프레임마다 마커의 가시성 체크
  useFrame(() => {
    // 마커 방향 벡터 (원점 → 마커, 회전 적용 전 로컬 좌표)
    const markerDir = position.clone().normalize();

    // Globe의 Y축 회전을 마커 벡터에 적용
    // group rotation을 적용하여 월드 좌표계로 변환
    const rotationEuler = new THREE.Euler(...UiConstant.globe.rotation);
    markerDir.applyEuler(rotationEuler);

    // 카메라 방향 벡터 (원점 → 카메라, 이미 월드 좌표계)
    const cameraDir = camera.position.clone().normalize();

    // 내적 계산: 두 벡터가 이루는 각도의 코사인 값
    const dotProduct = markerDir.dot(cameraDir);

    // 내적 > 0: 각도 < 90도 → 같은 반구 (보임)
    // 내적 ≤ 0: 각도 ≥ 90도 → 반대 반구 (숨김)
    // 0.1을 임계값으로 사용하여 경계에서 깜빡임 방지
    setIsVisible(dotProduct > 0.1);
  });

  const scale = appliedStyle.scale || defaultScale;
  const iconSize = 24 * scale;

  // 마커가 지구 뒤편에 있으면 렌더링하지 않음
  if (!isVisible) {
    return null;
  }

  return (
    <group position={position}>
      <Html
        center
        style={{
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            cursor: onMarkerClick ? 'pointer' : 'default',
            userSelect: 'none',
          }}
        >
          {/* SVG 아이콘 */}
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              transform: `translateY(${iconSize / 2}px)`,
            }}
          >
            <path d={iconShape} fill={appliedStyle.fill} stroke={appliedStyle.stroke} />
          </svg>

          {/* 라벨 */}
          {showLabels && label && (
            <div
              style={{
                fontSize: `${12 * scale}px`,
                fontWeight: 'bold',
                color: 'white',
                background: 'rgba(0,0,0,0.8)',
                padding: `${4 * scale}px ${8 * scale}px`,
                borderRadius: `${4 * scale}px`,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                transform: `translateY(${iconSize / 2}px)`,
              }}
            >
              {label}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
