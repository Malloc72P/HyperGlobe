'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import type { DirectionalLight } from 'three';
import { useThrottle } from '../../hooks/use-throttle';
import { useMainStore, type UpdateTooltipPositionFnParam } from '../../store';
import { FpsCounter, FpsDisplay } from '../fps-counter';
import { LoadingUI } from '../loading-ui';
import { Tooltip, type TooltipOptions } from '../tooltip';
import { Globe, type GlobeStyle } from './globe';
import { UiConstant } from 'src/constants';

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
}: HyperGlobeProps) {
  const rootElementRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<DirectionalLight>(null);
  const [fps, setFps] = useState(0);

  //   store
  const tooltipRef = useMainStore((s) => s.tooltipRef);
  const cleanMainStore = useMainStore((s) => s.clean);

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

  return (
    <div
      ref={rootElementRef}
      style={{ position: 'relative', overflow: 'hidden' }}
      onPointerMove={onPointerMove}
    >
      <LoadingUI loading={loading} />
      <Canvas
        id={id}
        style={{ aspectRatio: '1 / 1', width: size, maxWidth: maxSize, ...style }}
        camera={{ position: [0, 0, 5], fov: 25 }}
      >
        {/* 기본 조명 설정 */}
        <ambientLight intensity={2} />
        <directionalLight ref={lightRef} position={[0, 0, 5]} intensity={2} />

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
        {/* 0,0,0을 하면 [1, 0, 0]이 경위도 0,0이 된다. y축으로 90도 회전시키면, [0, 0, 1]이 경위도 0,0이 된다. */}
        <group rotation={UiConstant.globe.rotation}>
          <Globe wireframe={wireframe} {...globeStyle} />

          {/* Children */}
          {children}
        </group>

        {/* FPS Counter */}
        {showFpsCounter && <FpsCounter onFpsUpdate={setFps} />}

        {/* 툴팁 */}
      </Canvas>

      <Tooltip {...tooltipOptions} />
      {showFpsCounter && <FpsDisplay fps={fps} />}
    </div>
  );
}
