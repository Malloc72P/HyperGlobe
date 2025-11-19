import { Line } from '@react-three/drei';
import { useMemo } from 'react';
import { MathConstants, OrthographicProj } from '@hyperglobe/tools';
import type { Coordinate, VectorCoordinate } from '@hyperglobe/interfaces';
import { UiConstant } from '../../constants';
import { FeatureStyle } from 'src/types/feature';

export interface RouteFeatureProps {
  style?: FeatureStyle;
}

export function RouteFeature({}: RouteFeatureProps) {
  const vectors = useMemo<VectorCoordinate[]>(() => {
    return [];
  }, []);

  return <Line points={vectors} />;
}
