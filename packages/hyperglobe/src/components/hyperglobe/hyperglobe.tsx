'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { UiConstant } from 'src/constants';
import { MainStoreProvider } from 'src/store/main-store-provider';
import { NoToneMapping, type DirectionalLight } from 'three';
import { useHGM } from '../../hooks/use-hgm';
import { useIntersectionObserver } from '../../hooks/use-intersection-observer';
import { useMainStore } from '../../store';
import type { CameraTransitionOptions, HyperglobeRef, PathPoint } from '../../types/camera';
import type { HyperGlobeProps } from '../../types/hyperglobe-props';
import type { CameraTransitionControllerRef } from '../camera-transition-controller';
import { CameraTransitionController } from '../camera-transition-controller';
import { ColorScaleBar } from '../colorscale-bar';
import { FpsCounter, FpsDisplay } from '../fps-counter';
import { Graticule } from '../graticule';
import { LoadingUI } from '../loading-ui';
import { MarkerFeature } from '../marker-feature';
import { RegionFeatureCollection } from '../region-feature-collection';
import { RouteFeature } from '../route-feature';
import { Tooltip } from '../tooltip';
import { Globe } from './globe';
import { useCamera } from './use-camera';
import { useColorScaleBarConfig, useGraticuleConfig, useTooltipConfig } from './use-feature-config';
import { useHyperGlobeConfig } from './use-hyperglobe-config';
import { useTooltipPosition } from './use-tooltip-position';
import { useColorScale } from 'src/hooks/use-colorscale';
export type { HyperGlobeProps } from '../../types/hyperglobe-props';

/**
 * **WEBGL 기반 지구본 컴포넌트.**
 *
 * - HyperGlobe 컴포넌트의 루트 컴포넌트입니다.
 * - Props를 통해 지구본, 피처, UI 등을 설정합니다.
 * - hgm이 null이면 로딩 상태로 간주됩니다.
 *
 * ### import
 *
 * ```tsx
 * import { HyperGlobe } from 'hyperglobe';
 * ```
 *
 */
export const HyperGlobe = forwardRef<HyperglobeRef, HyperGlobeProps>((props, ref) => {
  return (
    <MainStoreProvider>
      <HyperGlobeInner {...props} ref={ref} />
    </MainStoreProvider>
  );
});

/**
 * HyperGlobe 컴포넌트의 내부 구현
 */
const HyperGlobeInner = forwardRef<HyperglobeRef, HyperGlobeProps>(
  (
    {
      hgmUrl,
      dataMap,
      id,
      size = '100%',
      maxSize,
      style,
      globe,
      camera,
      controls,
      region,
      graticule,
      routes,
      marker,
      colorscale,
      tooltip,
      showFpsCounter = false,
      showLoadingUI = true,
      lazyLoad = true,
      lazyLoadThreshold = 0.1,
      onReady,
    },
    ref
  ) => {
    /**
     * Configs
     */
    const {
      cameraFov,
      minDistance,
      maxDistance,
      initialCameraPosition,
      enableZoom,
      enableRotate,
      enablePan,
      globeStyle,
      wireframe,
      colorscaleOptions,
      colorscaleBar,
    } = useHyperGlobeConfig({ controls, globe, camera, colorscale, dataMap, region });

    const [graticuleConfig] = useGraticuleConfig(graticule);
    const [tooltipConfig] = useTooltipConfig(tooltip);
    const [colorscaleBarConfig] = useColorScaleBarConfig(colorscaleBar);
    const { colorscaleModel } = useColorScale(
      colorscaleOptions
        ? {
            ...colorscaleOptions,
            data: region?.dataKey && dataMap ? dataMap[region.dataKey] || [] : [],
          }
        : undefined
    );

    /** Refs */
    const rootElementRef = useRef<HTMLDivElement>(null);
    const lightRef = useRef<DirectionalLight>(null);
    const cameraTransitionRef = useRef<CameraTransitionControllerRef>(null);
    const onReadyCalledRef = useRef(false);

    /** State */
    const [fps, setFps] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [cameraControllerReady, setCameraControllerReady] = useState(false);

    /** 뷰 포트에 컴포넌트가 있는지 여부를 판단하는 훅 */
    const [intersectionRef, isIntersecting] = useIntersectionObserver({
      threshold: lazyLoadThreshold,
      triggerOnce: true,
    });

    /** HGM 로딩 */
    const [hgm] = useHGM({
      hgmUrl,
      shouldLoad: !lazyLoad || isIntersecting, // lazyLoad가 비활성화된 경우 항상 로드 가능한 것으로 간주
      onReadyCalledRef,
      setCameraControllerReady,
    });

    /** Store */
    const tooltipRef = useMainStore((s) => s.tooltipRef);
    const cleanMainStore = useMainStore((s) => s.clean);
    const loading = useMainStore((s) => s.loading);

    /** Callbacks */
    const [onPointerMove] = useTooltipPosition({
      rootElementRef,
      tooltipRef,
      tooltipConfig,
    });

    /** Camera 설정 */
    const {
      cameraVector,
      callbacks: {
        handleLockChange,
        handleCameraPositionChange,
        handleCameraChange,
        handleCameraControllerMount,
      },
    } = useCamera({
      lightRef,
      setIsLocked,
      initialCameraPosition,
      setCameraControllerReady,
    });

    /** Region 데이터 */
    const regionData = useMemo(() => {
      if (!region?.dataKey || !dataMap) return undefined;

      return dataMap[region.dataKey];
    }, [region?.dataKey, dataMap]);

    /** Imperative Handle */
    useImperativeHandle(
      ref,
      () => ({
        followPath: (path: PathPoint[], options?: CameraTransitionOptions) => {
          cameraTransitionRef.current?.followPath(path, options);
        },
        cancelTransition: () => {
          cameraTransitionRef.current?.cancelTransition();
        },
      }),
      []
    );

    /** 클린업 */
    useEffect(() => {
      return () => {
        cleanMainStore();
      };
    }, [cleanMainStore]);

    /** onReady 호출 (hgm 로드 완료 + 카메라 컨트롤러 준비 완료 후) */
    useEffect(() => {
      if (!loading && cameraControllerReady && !onReadyCalledRef.current && onReady) {
        onReady();
        onReadyCalledRef.current = true;
      }
    }, [loading, cameraControllerReady, onReady]);

    // === Render ===
    return (
      <div
        ref={(node) => {
          // rootElementRef와 intersectionRef 모두에 할당
          (rootElementRef as any).current = node;
          (intersectionRef as any).current = node;
        }}
        style={{ position: 'relative', overflow: 'hidden' }}
        onPointerMove={onPointerMove}
      >
        {/* 로딩 UI */}
        {showLoadingUI && <LoadingUI loading={loading} />}

        {/* 툴팁 */}
        {tooltipConfig && (
          <Tooltip
            style={tooltipConfig.style}
            distance={tooltipConfig.distance}
            text={tooltipConfig.text}
          />
        )}

        {/* FPS 표시 */}
        {showFpsCounter && <FpsDisplay fps={fps} />}

        {/* Canvas */}
        <Canvas
          id={id}
          gl={{
            toneMapping: NoToneMapping,
          }}
          style={{ aspectRatio: '1 / 1', width: size, maxWidth: maxSize, ...style }}
          camera={{ position: cameraVector, fov: cameraFov }}
        >
          {/* 조명 */}
          <ambientLight intensity={2} />
          <directionalLight ref={lightRef} position={cameraVector} intensity={2} />

          {/* 카메라 컨트롤 */}
          <OrbitControls
            enabled={!isLocked}
            enableZoom={enableZoom}
            enableRotate={enableRotate}
            enablePan={enablePan}
            minDistance={minDistance}
            maxDistance={maxDistance}
            onChange={handleCameraChange}
          />

          {/* 카메라 트랜지션 */}
          <CameraTransitionController
            ref={cameraTransitionRef}
            onLockChange={handleLockChange}
            onCameraPositionChange={handleCameraPositionChange}
            onMount={handleCameraControllerMount}
          />

          {/* 지구본 그룹 */}
          <group rotation={UiConstant.globe.rotation}>
            {/* Globe */}
            <Globe
              wireframe={wireframe}
              //onHoverChanged={onHoverChanged}
              {...globeStyle}
            />
            {/* Region Features */}
            {hgm && (
              <RegionFeatureCollection
                features={hgm.features}
                data={regionData}
                style={region?.style}
                hoverStyle={region?.hoverStyle}
                idField={region?.idField}
                dataIdField={region?.dataIdField}
                colorscale={colorscaleModel}
                extrusion={region?.extrusion}
                transition={region?.transition}
              />
            )}
            {/* Graticule */}
            {graticuleConfig && (
              <Graticule
                longitudeStep={graticuleConfig.longitudeStep}
                latitudeStep={graticuleConfig.latitudeStep}
                lineColor={graticuleConfig.lineColor}
                lineWidth={graticuleConfig.lineWidth}
                transition={graticuleConfig.transition}
              />
            )}
            {/* Routes */}
            {routes?.map((route) => (
              <RouteFeature
                key={route.id}
                from={route.from}
                to={route.to}
                maxHeight={route.maxHeight}
                lineWidth={route.lineWidth}
                segments={route.segments}
                style={route.style}
                animated={route.animated}
                animationDuration={route.animationDuration}
                animationDelay={route.animationDelay}
                objectScale={route.objectScale}
              />
            ))}
            {/* Markers */}
            {marker?.items.map((item) => (
              <MarkerFeature
                key={item.id}
                id={item.id}
                coordinate={item.coordinate}
                icon={item.icon}
                iconPath={item.iconPath}
                label={item.label}
                style={item.style}
                scale={item.scale}
                showLabels={item.showLabels}
                onMarkerClick={item.onMarkerClick ? () => item.onMarkerClick?.(item) : undefined}
                transition={item.transition}
              />
            ))}{' '}
          </group>

          {/* FPS Counter */}
          {showFpsCounter && <FpsCounter onFpsUpdate={setFps} />}
        </Canvas>

        {/* ColorscaleBar (Canvas 외부, HTML) */}
        {colorscaleBarConfig && colorscaleModel && (
          <ColorScaleBar
            colorScale={colorscaleModel}
            style={{
              ...colorscaleBarConfig.style,
            }}
            formatLabel={colorscaleBarConfig.formatLabel}
          />
        )}
      </div>
    );
  }
);
