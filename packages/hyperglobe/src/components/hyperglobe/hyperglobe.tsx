'use client';

import { Coordinate } from '@hyperglobe/interfaces';
import { OrthographicProj } from '@hyperglobe/tools';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CameraTransitionControllerRef } from '../camera-transition-controller';
import { UiConstant } from 'src/constants';
import { NoToneMapping, Vector3, type DirectionalLight } from 'three';
import { useThrottle } from '../../hooks/use-throttle';
import { useMainStore, type UpdateTooltipPositionFnParam } from '../../store';
import { FpsCounter, FpsDisplay } from '../fps-counter';
import { LoadingUI } from '../loading-ui';
import { Tooltip } from '../tooltip';
import type { CameraTransitionOptions, HyperglobeRef, PathPoint } from '../../types/camera';
import type {
  HyperGlobeProps,
  TooltipConfig,
  GraticuleConfig,
  ColorscaleBarConfig,
} from '../../types/hyperglobe-props';
import { CameraTransitionController } from '../camera-transition-controller';
import { Globe } from './globe';
import { MainStoreProvider } from 'src/store/main-store-provider';
import { RegionFeatureCollection } from '../region-feature-collection';
import { Graticule } from '../graticule';
import { ColorScaleBar } from '../colorscale-bar';
import { RouteFeature } from '../route-feature';
import { MarkerFeature } from '../marker-feature';
import { useHGM } from '../../hooks/use-hgm';
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
      // 필수
      hgmUrl,

      // 데이터
      dataMap,

      // 캔버스/컨테이너
      id,
      size = '100%',
      maxSize,
      style,

      // 지구본
      globe,

      // 카메라
      camera,

      // 컨트롤
      controls,

      // 피쳐
      region,
      graticule,
      routes,
      markers,

      // UI
      colorscale,
      colorscaleBar,
      tooltip,
      showFpsCounter = true,
      showLoadingUI = true,

      // 이벤트
      onReady,
      onHoverChanged,
    },
    ref
  ) => {
    // === Refs ===
    const rootElementRef = useRef<HTMLDivElement>(null);
    const lightRef = useRef<DirectionalLight>(null);
    const cameraTransitionRef = useRef<CameraTransitionControllerRef>(null);
    const onReadyCalledRef = useRef(false);

    // === State ===
    const [fps, setFps] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [cameraControllerReady, setCameraControllerReady] = useState(false);
    const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);

    // === HGM 로딩 ===
    const [hgm] = useHGM({ rawHgmBlob });

    // hgmUrl이 변경되면 HGM 파일을 다시 로드
    useEffect(() => {
      if (!hgmUrl) return;

      // 이전 데이터 초기화
      setRawHgmBlob(null);
      onReadyCalledRef.current = false;
      setCameraControllerReady(false);

      fetch(hgmUrl)
        .then((res) => res.blob())
        .then(setRawHgmBlob)
        .catch((err) => {
          console.error(`Failed to load HGM file: ${hgmUrl}`, err);
        });
    }, [hgmUrl]);

    // === Store ===
    const tooltipRef = useMainStore((s) => s.tooltipRef);
    const cleanMainStore = useMainStore((s) => s.clean);
    const setLoading = useMainStore((s) => s.setLoading);

    // === Derived State ===
    const isLoading = hgm === null;

    // === 카메라 설정 ===
    const initialCameraPosition = camera?.initialPosition ?? [0, 0];
    const cameraFov = 25;
    const minDistance = Math.max(camera?.minDistance ?? 1.5, 1.5);
    const maxDistance = Math.min(camera?.maxDistance ?? 10, 10);

    const cameraVector = useMemo(() => {
      const adjustedCoordinate: Coordinate = [
        initialCameraPosition[0] - 90,
        initialCameraPosition[1],
      ];
      return OrthographicProj.project(adjustedCoordinate, 5);
    }, [initialCameraPosition]);

    // === 컨트롤 설정 ===
    const enableZoom = controls?.enableZoom ?? true;
    const enableRotate = controls?.enableRotate ?? true;
    const enablePan = controls?.enablePan ?? false;

    // === 지구본 설정 ===
    const globeStyle = globe?.style;
    const wireframe = globe?.wireframe ?? false;

    // === Graticule 설정 ===
    const graticuleConfig = useMemo<GraticuleConfig | null>(() => {
      if (!graticule) return null;
      if (graticule === true) return {};
      return graticule;
    }, [graticule]);

    // === Tooltip 설정 ===
    const tooltipConfig = useMemo<TooltipConfig | null>(() => {
      const defaultTooltipConfig = { show: true };

      // 설정 아예 안하면 툴팁 표시하는걸로 간주
      if (tooltip === null || tooltip === undefined) return defaultTooltipConfig;

      if (!tooltip) return { show: false };

      if (tooltip === true) return defaultTooltipConfig;

      return tooltip;
    }, [tooltip]);

    // === ColorscaleBar 설정 ===
    const colorscaleBarConfig = useMemo<ColorscaleBarConfig | null>(() => {
      if (!colorscaleBar) return null;
      if (colorscaleBar === true) return {};
      return colorscaleBar;
    }, [colorscaleBar]);

    // === Region 데이터 ===
    const regionData = useMemo(() => {
      if (!region?.dataKey || !dataMap) return undefined;
      return dataMap[region.dataKey];
    }, [region?.dataKey, dataMap]);

    // === Callbacks ===
    const handleLockChange = useCallback((locked: boolean) => {
      setIsLocked(locked);
    }, []);

    const handleCameraPositionChange = useCallback((position: Vector3) => {
      const light = lightRef.current;
      if (!light) return;

      light.position.set(0, 0, 0);
      light.position.add(position);
    }, []);

    const handleCameraChange = useCallback((e: any) => {
      const cameraObj = e?.target.object;
      const light = lightRef.current;

      if (!light || !cameraObj) return;

      light.position.set(0, 0, 0);
      light.position.add(cameraObj.position);
    }, []);

    // === Tooltip Position ===
    const getTooltipPosition = useCallback(
      ({ point, tooltipElement }: UpdateTooltipPositionFnParam) => {
        const tooltipOffset = tooltipConfig?.distance ?? 10;
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

        nextPosition.x = nextPosition.x - tooltipWidth / 2;
        nextPosition.y = nextPosition.y - tooltipHeight - tooltipOffset;

        return nextPosition;
      },
      [tooltipConfig?.distance]
    );

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

    // === Imperative Handle ===
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

    // === Effects ===

    // 클린업
    useEffect(() => {
      return () => {
        cleanMainStore();
      };
    }, [cleanMainStore]);

    // 로딩 상태 동기화
    useEffect(() => {
      setLoading(isLoading);
    }, [isLoading, setLoading]);

    // onReady 호출 (hgm 로드 완료 + 카메라 컨트롤러 준비 완료 후)
    useEffect(() => {
      if (!isLoading && cameraControllerReady && !onReadyCalledRef.current && onReady) {
        onReady();
        onReadyCalledRef.current = true;
      }
    }, [isLoading, cameraControllerReady, onReady]);

    // 카메라 컨트롤러 마운트 핸들러
    const handleCameraControllerMount = useCallback(() => {
      setCameraControllerReady(true);
    }, []);

    // === Render ===
    return (
      <div
        ref={rootElementRef}
        style={{ position: 'relative', overflow: 'hidden' }}
        onPointerMove={onPointerMove}
      >
        {/* 로딩 UI */}
        {showLoadingUI && <LoadingUI loading={isLoading} />}

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
                colorscale={colorscale?.model}
                extrusion={region?.extrusion}
              />
            )}
            {/* Graticule */}
            {graticuleConfig && (
              <Graticule
                longitudeStep={graticuleConfig.longitudeStep}
                latitudeStep={graticuleConfig.latitudeStep}
                lineColor={graticuleConfig.lineColor}
                lineWidth={graticuleConfig.lineWidth}
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
            {markers?.items.map((marker) => (
              <MarkerFeature
                key={marker.id}
                coordinate={marker.coordinate}
                icon={marker.icon}
                iconPath={marker.iconPath}
                label={marker.label}
                style={marker.style}
                scale={marker.scale}
                defaultScale={markers.defaultScale}
                showLabels={markers.showLabels}
                onMarkerClick={
                  markers.onMarkerClick ? () => markers.onMarkerClick?.(marker) : undefined
                }
              />
            ))}{' '}
          </group>

          {/* FPS Counter */}
          {showFpsCounter && <FpsCounter onFpsUpdate={setFps} />}
        </Canvas>

        {/* ColorscaleBar (Canvas 외부, HTML) */}
        {colorscaleBarConfig && colorscale?.model && (
          <ColorScaleBar
            colorScale={colorscale.model}
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
