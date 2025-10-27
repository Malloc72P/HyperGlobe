import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Globe } from './globe';
import { CoordinateSystem } from '../coordinate-system';
import { useState, type PropsWithChildren } from 'react';
import { LoadingUI } from '../loading-ui';
import type { GeoJSON, Feature, MultiPolygon, Polygon, FeatureCollection } from 'geojson';
import { RegionFeature, type RegionFeatureProps } from '../region-feature';

/**
 * HyperGlobe 컴포넌트의 Props
 */
export interface HyperGlobeProps extends PropsWithChildren {
  /**
   * Canvas 요소의 id 속성
   */
  id?: string;
  /**
   * 로딩 상태 표시 여부. <br />
   * true일 경우 로딩 UI가 캔버스 위에 표시됩니다.
   */
  loading?: boolean;
  /**
   * 지구본의 크기
   */
  size?: number;
  /**
   * 좌표축 시각화 여부
   */
  coordinateSystemVisible?: boolean;
  /**
   * wireframe
   */
  wireframe?: boolean;
  /**
   * 지구본의 초기 회전 각도 (라디안 단위)
   */
  rotation?: [number, number, number];
  /**
   * 텍스처 사용 여부
   */
  textureEnabled?: boolean;
  /**
   * 지구 보이기 여부
   */
  globeVisible?: boolean;
  /**
   * 지도 데이터 (GeoJSON 형식)
   *
   * - 해당 데이터를 통해 지구본에 리젼 피쳐를 렌더링할 수 있습니다.
   * - ex: 국가별 경계 정보를 담은 GeoJSON 데이터를 전달하여 국가 경계선을 리젼 피쳐로 표현.
   * - 폴리곤, 멀티폴리곤 형식의 지오메트리만 지원합니다.
   */
  mapData?: FeatureCollection<MultiPolygon, Polygon>;
  regionStyle?: Pick<
    RegionFeatureProps,
    'color' | 'lineWidth' | 'fill' | 'fillColor' | 'fillOpacity' | 'wireframe'
  >;
}

/**
 * **WEBGL 기반 지구본 컴포넌트.**
 *
 * - HyperGlobe 컴포넌트의 루트 컴포넌트입니다.
 * - 해당 컴포넌트를 통해 지구본을 랜더링하고 다양한 3D 피쳐들을 자식 컴포넌트로 추가할 수 있습니다.
 * - 피쳐를 추가하려면 RegionFeature, Graticule등의 컴포넌트를 자식 컴포넌트로 추가하면 됩니다
 * ```
 * <HyperGlobe>
 *     <Graticule />
 *     {features.map((feature) => <RegionFeature feature={feature} />)}
 * </HyperGlobe>
 * ```
 *
 */
export function HyperGlobe({
  id,
  loading = false,
  size = 600,
  coordinateSystemVisible,
  wireframe,
  children,
  mapData,
  rotation = [0, -Math.PI / 2, 0],
  textureEnabled = true,
  globeVisible = true,
  regionStyle,
}: HyperGlobeProps) {
  const [isRendered, setIsRendered] = useState<boolean>(false);

  return (
    <div style={{ position: 'relative' }}>
      <LoadingUI loading={loading} />
      <Canvas
        id={id}
        style={{ height: size }}
        // 초기 카메라 위치
        camera={{ position: [0, 0, 5], fov: 25 }}
        data-is-rendered={isRendered ? 'true' : 'false'}
      >
        {/* 기본 조명 설정 */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* 마우스로 카메라 조작 가능하게 하는 컨트롤 */}
        <OrbitControls
          enableZoom={true}
          enableRotate={true}
          /**
           * 카메라가 타겟에 얼마나 가까이 갈 수 있는지를 제한
           */
          minDistance={3}
          /**
           * 카메라가 타겟에서 얼마나 멀어질 수 있는지를 제한
           */
          maxDistance={10}
        />

        {/* 지구본과 피쳐를 그룹으로 묶어 함께 회전 */}
        <group rotation={rotation}>
          <Globe
            visible={globeVisible}
            isRendered={isRendered}
            setIsRendered={setIsRendered}
            wireframe={wireframe}
            textureEnabled={textureEnabled}
          />

          {/* Children */}
          {children}

          {/* Region Features by MapData */}
          {mapData &&
            mapData.features.map((feature) => (
              <RegionFeature key={feature.id} feature={feature} {...regionStyle} />
            ))}
        </group>

        {/* 좌표축 시각화 헬퍼들 */}
        {coordinateSystemVisible && <CoordinateSystem />}
      </Canvas>
    </div>
  );
}
