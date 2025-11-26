import { useMemo } from 'react';
import { CIRCLE_ICON, PIN_ICON } from './marker-constant';
import { MarkerData } from './marker-interface';

export function useMarkerShape({ icon, iconPath }: Pick<MarkerData, 'icon' | 'iconPath'>) {
  const iconShape = useMemo(() => {
    switch (icon) {
      case 'pin':
        return PIN_ICON;
      case 'circle':
        return CIRCLE_ICON;
      case 'custom':
        if (!iconPath) {
          console.error('iconPath가 지정되지 않았습니다!', iconPath);
        }

        return iconPath;
      default:
        return PIN_ICON;
    }
  }, [icon, iconPath]);

  return [iconShape];
}
