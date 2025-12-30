import { ColorScaleWithDataOptions } from 'src/hooks/use-colorscale';
import { ColorscaleBarConfig, ColorscaleConfig, ControlsConfig, HyperGlobeProps } from 'src/types';

export type UseHyperGlobeConfigProps = Pick<
  HyperGlobeProps,
  'controls' | 'globe' | 'camera' | 'colorscale' | 'dataMap' | 'region'
>;

export function useHyperGlobeConfig({
  controls,
  globe,
  camera,
  colorscale,
  dataMap,
  region,
}: UseHyperGlobeConfigProps) {
  // === 카메라 설정 ===
  const cameraFov = 25;
  const minDistance = Math.max(camera?.minDistance ?? 1.5, 1.5);
  const maxDistance = Math.min(camera?.maxDistance ?? 10, 10);
  const initialCameraPosition = camera?.initialPosition ?? [0, 0];

  // === 컨트롤 설정 ===
  const enableZoom = controls?.enableZoom ?? true;
  const enableRotate = controls?.enableRotate ?? true;
  const enablePan = controls?.enablePan ?? false;

  // === 지구본 설정 ===
  const globeStyle = globe?.style;
  const wireframe = globe?.wireframe ?? false;

  // === 컬러스케일 설정 ===
  let regionDataKey: string | undefined = region?.dataKey;
  let colorscaleBar: ColorscaleBarConfig | boolean | undefined = undefined;
  let colorscaleOptions: ColorScaleWithDataOptions | undefined = undefined;

  if (colorscale && regionDataKey && dataMap) {
    const { colorscaleBar: csBarOp, ...csOptions } = colorscale;

    colorscaleBar = typeof csBarOp === 'boolean' ? csBarOp : { show: true };
    colorscaleOptions = {
      ...csOptions,
      data: dataMap[regionDataKey] || [],
    };
  }

  return {
    cameraFov,
    minDistance,
    maxDistance,
    initialCameraPosition,
    enableZoom,
    enableRotate,
    enablePan,
    globeStyle,
    wireframe,
    regionDataKey,
    colorscaleBar,
    colorscaleOptions,
  };
}
