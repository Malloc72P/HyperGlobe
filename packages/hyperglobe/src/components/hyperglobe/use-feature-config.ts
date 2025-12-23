import { useMemo } from 'react';
import { ColorscaleBarConfig, GraticuleConfig, TooltipConfig } from 'src/types';

export function useGraticuleConfig(graticule?: GraticuleConfig | boolean) {
  const graticuleConfig = useMemo<GraticuleConfig | null>(() => {
    if (!graticule) return null;
    if (graticule === true) return {};

    return graticule;
  }, [graticule]);

  return [graticuleConfig];
}

export function useTooltipConfig(tooltip?: TooltipConfig | boolean) {
  const tooltipConfig = useMemo<TooltipConfig | null>(() => {
    const defaultTooltipConfig = { show: true };

    // 설정 아예 안하면 툴팁 표시하는걸로 간주
    if (tooltip === null || tooltip === undefined) return defaultTooltipConfig;

    if (!tooltip) return { show: false };

    if (tooltip === true) return defaultTooltipConfig;

    return tooltip;
  }, [tooltip]);

  return [tooltipConfig];
}

export function useColorScaleBarConfig(colorscaleBar?: ColorscaleBarConfig | boolean) {
  const colorscaleBarConfig = useMemo<ColorscaleBarConfig | null>(() => {
    if (!colorscaleBar) return null;
    if (colorscaleBar === true) return {};

    return colorscaleBar;
  }, [colorscaleBar]);

  return [colorscaleBarConfig];
}
