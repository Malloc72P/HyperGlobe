import { Coordinate } from '@hyperglobe/interfaces';
import { CoordinateConverter } from '@hyperglobe/tools';
import { RefObject, useCallback, useMemo } from 'react';
import { CameraConfig } from 'src/types';
import { DirectionalLight, Light, Vector3 } from 'three';

export interface UseCameraCallbacksProps {
  camera?: CameraConfig;
  lightRef: RefObject<DirectionalLight | null>;
  setIsLocked: (locked: boolean) => void;
  initialCameraPosition: [number, number];
}

export function useCamera({
  camera,
  lightRef,
  setIsLocked,
  initialCameraPosition,
}: UseCameraCallbacksProps) {
  const cameraVector = useMemo(() => {
    const adjustedCoordinate: Coordinate = [
      initialCameraPosition[0] - 90,
      initialCameraPosition[1],
    ];

    return CoordinateConverter.convert(adjustedCoordinate, 5);
  }, [initialCameraPosition]);

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

  return {
    cameraVector,
    callbacks: { handleLockChange, handleCameraPositionChange, handleCameraChange },
  };
}
