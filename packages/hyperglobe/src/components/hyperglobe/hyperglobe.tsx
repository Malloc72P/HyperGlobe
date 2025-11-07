import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { CoordinateSystem } from '../coordinate-system';
import { LoadingUI } from '../loading-ui';
import { Globe, type GlobeProps, type GlobeStyle } from './globe';
import type { DirectionalLight } from 'three';
import { Tooltip, type TooltipProps } from '../tooltip';
import type { Coordinate2D } from '../../types/tooltip';
import { useThrottle } from '../../hooks/use-throttle';
import { useMainStore, type UpdateTooltipPositionFnParam } from '../../store';
import { FpsCounter, FpsDisplay } from '../fps-counter';
import type { HGM, RawHGMFile } from '@hyperglobe/interfaces';
import { RegionFeature2, type RegionFeature2Props } from '../region-feature2';
import { RegionFeature } from '../region-feature';
import { base64ToFloat32Array, base64ToUInt32Array, toNumArray } from 'src/lib';

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
  size?: number | string;
  /**
   * 지구본의 최대 크기
   */
  maxSize?: number | string;
  /**
   * wireframe
   */
  wireframe?: boolean;
  /**
   * 지구본의 초기 회전 각도 (라디안 단위)
   */
  rotation?: [number, number, number];
  /**
   * Canvas 요소에 적용할 스타일 객체
   */
  style?: React.CSSProperties;
  /**
   * 지구본의 공통 스타일 설정
   */
  globeStyle?: GlobeStyle;
  /**
   * 툴팁 옵션
   */
  tooltipOption?: TooltipProps;
  /**
   * FPS(초당 프레임 수) 카운터 표시 여부
   */
  showFpsCounter?: boolean;

  /**
   * 지역을 그리는데 필요한 지도 데이터(HGM 포맷).
   *
   * - HGM 파일은 Hyperglobe의 커스텀 지리 공간 데이터 포맷입니다.
   * - 해당 데이터는 geoJson으로 생성할 수 있으며 Hyperglobe/cli를 통해 HGM 포맷으로 변환할 수 있습니다.
   */
  hgm?: Blob | null;

  /**
   * 리젼 피쳐의 공통 스타일 설정
   */
  regionOption: Pick<RegionFeature2Props, 'style' | 'hoverStyle' | 'metalness' | 'roughness'>;
}

/**
 * **WEBGL 기반 지구본 컴포넌트.**
 *
 * - HyperGlobe 컴포넌트의 루트 컴포넌트입니다.
 * - 해당 컴포넌트를 통해 지구본을 랜더링하고 다양한 3D 피쳐들을 자식 컴포넌트로 추가할 수 있습니다.
 * - 피쳐를 추가하려면 RegionFeature, Graticule등의 컴포넌트를 자식 컴포넌트로 추가하면 됩니다
 *
 * ### 예시
 *
 * ```tsx
 * <HyperGlobe>
 *     <Graticule />
 * </HyperGlobe>
 * ```
 *
 * ### import
 *
 * ```
 * import { HyperGlobe } from 'hyperglobe';
 * ```
 *
 */
export function HyperGlobe({
  id,
  loading = false,
  size = '100%',
  maxSize,
  wireframe,
  children,
  rotation = [0, -Math.PI / 2, 0],
  globeStyle,
  style,
  tooltipOption,
  showFpsCounter = true,
  hgm,
  regionOption,
}: HyperGlobeProps) {
  const rootElementRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<DirectionalLight>(null);
  const [fps, setFps] = useState(0);
  const [hgmData, setHgmData] = useState<HGM | null>(null);

  useMemo(async () => {
    if (!hgm) return;

    const hgmData = hgm.stream().pipeThrough(new DecompressionStream('gzip'));
    const rawHGM = (await new Response(hgmData).json()) as RawHGMFile;

    const _hgm: HGM = {
      version: rawHGM.version,
      metadata: rawHGM.metadata,
      features: rawHGM.features.map((feature) => ({
        id: feature.id,
        p: feature.p,
        g: feature.g.map((src) => ({
          v: base64ToFloat32Array(src.v),
          i: base64ToUInt32Array(src.i),
        })),
        b: {
          p: base64ToFloat32Array(feature.b.p),
        },
      })),
    };

    setHgmData(_hgm);
  }, [hgm]);

  //   store
  const registerUpdateTooltipPosition = useMainStore((s) => s.registerGetTooltipPosition);
  const tooltipRef = useMainStore((s) => s.tooltipRef);

  const getTooltipPosition = useThrottle<[UpdateTooltipPositionFnParam], Coordinate2D | null>({
    fn: ({ point, tooltipElement }: UpdateTooltipPositionFnParam) => {
      const tooltipOffset = 10;
      const rootElement = rootElementRef.current;

      if (!rootElement || !tooltipElement) return null;

      const rootRect = rootElement.getBoundingClientRect();
      const tooltipRect = tooltipElement.getBoundingClientRect();
      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;

      const nextPosition = {
        x: point.x - rootRect.left,
        y: point.y - rootRect.top,
      };

      // 툴팁을 마우스 커서 위에 약간 띄워서 표시, 중간 정렬
      nextPosition.x = nextPosition.x - tooltipWidth / 2;
      nextPosition.y = nextPosition.y - tooltipHeight - tooltipOffset;

      return nextPosition;
    },
    delay: 25,
  });

  useEffect(() => {
    registerUpdateTooltipPosition(getTooltipPosition);
  }, [getTooltipPosition]);

  return (
    <div
      ref={rootElementRef}
      style={{ position: 'relative', overflow: 'hidden' }}
      /**
       * 성능을 위해 툴팁 위치를 state로 관리하지 않고 직접 스타일을 변경한다.
       */
      //   onPointerMove={(e) => {
      //     const tooltip = tooltipRef?.current;
      //     const { clientX, clientY } = e;

      //     if (!tooltip || !getTooltipPosition) return;

      //     const nextPosition = getTooltipPosition({
      //       point: { x: clientX, y: clientY },
      //       tooltipElement: tooltip,
      //     });

      //     if (!nextPosition) return;

      //     tooltip.style.transform = `translate(${nextPosition?.x}px, ${nextPosition?.y}px)`;
      //   }}
    >
      <LoadingUI loading={loading} />
      <Canvas
        id={id}
        // frameloop="demand"
        style={{ aspectRatio: '1 / 1', width: size, maxWidth: maxSize, ...style }}
        camera={{ position: [0, 0, 5], fov: 25 }}
      >
        {/* 기본 조명 설정 */}
        <ambientLight intensity={2} />
        <directionalLight ref={lightRef} position={[0, 0, 5]} intensity={1} />

        {/* 마우스로 카메라 조작 가능하게 하는 컨트롤 */}
        <OrbitControls
          enableZoom={true}
          enableRotate={true}
          /**
           * 카메라가 타겟에 얼마나 가까이 갈 수 있는지를 제한
           */
          minDistance={1.5}
          /**
           * 카메라가 타겟에서 얼마나 멀어질 수 있는지를 제한
           */
          maxDistance={10}
          onChange={(e) => {
            const camera = e?.target.object;
            const light = lightRef.current;

            if (!light || !camera) return;

            light.position.set(0, 0, 0);
            light.position.add(camera.position);
          }}
        />

        {/* 지구본과 피쳐를 그룹으로 묶어 함께 회전 */}
        <group rotation={rotation}>
          <Globe wireframe={wireframe} {...globeStyle} />

          {/* Children */}
          {children}

          {/* Region Features by MapData */}
          {hgmData?.features.map((f) => (
            <RegionFeature2 key={f.id} feature={f} {...regionOption} />
          ))}
        </group>

        {/* FPS Counter */}
        {showFpsCounter && <FpsCounter onFpsUpdate={setFps} />}

        {/* 툴팁 */}
      </Canvas>

      <Tooltip {...tooltipOption} />
      {showFpsCounter && <FpsDisplay fps={fps} />}
    </div>
  );
}
