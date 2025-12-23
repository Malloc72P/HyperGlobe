import type { HGM, RawHGMFile } from '@hyperglobe/interfaces';
import { useState, useEffect } from 'react';
import { base64ToFloat32Array, base64ToUInt32Array } from 'src/lib';
import { useMainStore } from 'src/store';

export interface UseHgmOptions {
  hgmUrl?: string;
  shouldLoad?: boolean;
  onReadyCalledRef: React.MutableRefObject<boolean>;
  setCameraControllerReady: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useHGM({
  hgmUrl,
  shouldLoad,
  onReadyCalledRef,
  setCameraControllerReady,
}: UseHgmOptions) {
  const [rawHgmBlob, setRawHgmBlob] = useState<Blob | null>(null);
  const setLoading = useMainStore((s) => s.setLoading);

  const [hgm, setHGM] = useState<HGM | null>(null);

  // hgmUrl이 변경되거나 shouldLoad가 true가 되면 HGM 파일을 로드
  useEffect(() => {
    if (!hgmUrl || !shouldLoad) return;

    // 이전 데이터 초기화
    setRawHgmBlob(null);
    onReadyCalledRef.current = false;
    setCameraControllerReady(false);

    fetch(hgmUrl)
      .then((res) => res.blob())
      .then((blob) => {
        setRawHgmBlob(blob);
      })
      .catch((err) => {
        console.error(`Failed to load HGM file: ${hgmUrl}`, err);
      });
  }, [hgmUrl, shouldLoad]);

  useEffect(() => {
    if (!rawHgmBlob) return;

    setLoading(true);

    const hgmData = rawHgmBlob.stream().pipeThrough(new DecompressionStream('gzip'));

    new Response(hgmData).json().then((rawHGM: RawHGMFile) => {
      const _hgm: HGM = {
        version: rawHGM.version,
        metadata: rawHGM.metadata,
        features: rawHGM.features.map((feature) => ({
          id: feature.id,
          properties: feature.p,
          geometries: feature.g.map((src) => ({
            vertices: base64ToFloat32Array(src.v),
            indices: base64ToUInt32Array(src.i),
          })),
          borderLines: {
            pointArrays: feature.l.p.map((base64) => base64ToFloat32Array(base64)),
          },
          bbox: feature.b,
        })),
      };

      setHGM(_hgm);
    });
  }, [rawHgmBlob]);

  return [hgm];
}
