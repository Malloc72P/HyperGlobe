'use client';

import { Coordinate } from '@hyperglobe/interfaces';
import { OrthographicProj } from '@hyperglobe/tools';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { UiConstant } from 'src/constants';
import type { OnHoverChangedFn } from 'src/types/events';
import { NoToneMapping, type DirectionalLight } from 'three';
import { useThrottle } from '../../hooks/use-throttle';
import { useMainStore, type UpdateTooltipPositionFnParam } from '../../store';
import { FpsCounter, FpsDisplay } from '../fps-counter';
import { LoadingUI } from '../loading-ui';
import { Tooltip, type TooltipOptions } from '../tooltip';
import { Globe, type GlobeStyle } from './globe';

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
  tooltipOptions?: TooltipOptions;
  /**
   * FPS(초당 프레임 수) 카운터 표시 여부
   */
  showFpsCounter?: boolean;
  /**
   * 호버된 지역이 변경될 때 호출되는 콜백 함수
   */
  onHoverChanged?: OnHoverChangedFn;
  /**
   * 카메라 중심의 위치.
   *
   * - 경위도 좌표계([경도, 위도])로 지정합니다.
   */
  initialCameraPosition?: Coordinate;
}

/**
 * **WEBGL 기반 지구본 컴포넌트.**
 *
 * - HyperGlobe 컴포넌트의 루트 컴포넌트입니다.
 * - 해당 컴포넌트만 사용하면 빈 지구본이 렌더링됩니다.
 * - 지구본의 스타일은 globeStyle prop을 통해 설정할 수 있습니다.
 * - 해당 컴포넌트를 통해 지구본을 랜더링하고 다양한 3D 피쳐들을 자식 컴포넌트로 추가할 수 있습니다.
 * - RegionFeature, Graticule등의 컴포넌트를 자식 컴포넌트로 추가할 수 있습니다.
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
  globeStyle,
  style,
  tooltipOptions,
  showFpsCounter = true,
  onHoverChanged,
  initialCameraPosition = [0, 0],
}: HyperGlobeProps) {
  const rootElementRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<DirectionalLight>(null);
  const [fps, setFps] = useState(0);

  // store
  const tooltipRef = useMainStore((s) => s.tooltipRef);
  const cleanMainStore = useMainStore((s) => s.clean);
  const setLoading = useMainStore((s) => s.setLoading);

  const cameraVector = useMemo(() => {
    const adjustedCoordinate: Coordinate = [
      initialCameraPosition[0] - 90,
      initialCameraPosition[1],
    ];

    return OrthographicProj.project(adjustedCoordinate, 5);
  }, [initialCameraPosition]);

  const getTooltipPosition = ({ point, tooltipElement }: UpdateTooltipPositionFnParam) => {
    const tooltipOffset = tooltipOptions?.distance || 10;
    const rootElement = rootElementRef.current;

    if (!rootElement || !tooltipElement) return null;

    const rootRect = rootElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;

    const nextPosition = {
      x: point[0] - rootRect.left,
      y: point[1] - rootRect.top,
    };

    // 툴팁을 마우스 커서 위에 약간 띄워서 표시, 중간 정렬
    nextPosition.x = nextPosition.x - tooltipWidth / 2;
    nextPosition.y = nextPosition.y - tooltipHeight - tooltipOffset;

    return nextPosition;
  };

  const onPointerMove = useThrottle({
    fn: (e) => {
      const tooltipElement = tooltipRef?.current;
      const { clientX, clientY } = e;

      if (!tooltipElement) return;

      const tooltipPosition = getTooltipPosition({
        point: [clientX, clientY],
        tooltipElement,
      });

      if (tooltipPosition) {
        const { x, y } = tooltipPosition;
        tooltipElement.style.transform = `translate(${x}px, ${y}px)`;
      }
    },
    delay: 50,
  });

  useEffect(() => {
    return () => {
      cleanMainStore();
    };
  }, []);

  useEffect(() => {
    setLoading(loading);
  }, [loading]);

  return (
    <div
      ref={rootElementRef}
      style={{ position: 'relative', overflow: 'hidden' }}
      onPointerMove={onPointerMove}
    >
      <LoadingUI loading={loading} />
      {/* 툴팁 */}
      <Tooltip {...tooltipOptions} />
      {showFpsCounter && <FpsDisplay fps={fps} />}
      <Canvas
        id={id}
        gl={{
          /**
           * 색상 값을 그대로 출력하기 위해 톤 매핑 비활성화.
           * HDR을 모니터가 표현할 수 있는 범위로 압축하는게 톤매핑인데, 지정한 색상이 그대로 나와야 하므로 비활성화함.
           * 추후에 옵션을 통해 설정할 수 있도록 개선할 수도 있음.
           */
          toneMapping: NoToneMapping,
        }}
        style={{ aspectRatio: '1 / 1', width: size, maxWidth: maxSize, ...style }}
        /**
         * 카메라 위치는 3차원 벡터로 설정, OrbitControls라서 target이 0,0,0, 즉 지구 중심을 바라본다.
         */
        camera={{ position: cameraVector, fov: 25 }}
      >
        {/* 기본 조명 설정 */}
        <ambientLight intensity={2} />
        <directionalLight ref={lightRef} position={cameraVector} intensity={2} />
        {/* 마우스로 카메라 조작 가능하게 하는 컨트롤 */}
        <OrbitControls
          enableZoom={true}
          enableRotate={true}
          enablePan={false}
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
        {/* 0,0,0을 하면 [1, 0, 0]이 경위도 0,0이 된다. y축으로 90도 회전시키면, [0, 0, 1]이 경위도 0,0이 된다. */}
        <group rotation={UiConstant.globe.rotation}>
          <Globe wireframe={wireframe} onHoverChanged={onHoverChanged} {...globeStyle} />

          {/* Children */}
          {children}
        </group>

        {/* FPS Counter */}
        {showFpsCounter && <FpsCounter onFpsUpdate={setFps} />}

        {/* <CoordinateSystem /> */}
      </Canvas>
    </div>
  );
}
