import type { HGM, RawHGMFile } from '@hyperglobe/interfaces';
import { useState, useEffect } from 'react';
import { base64ToFloat32Array, base64ToUInt32Array } from 'src/lib';
import { useMainStore } from 'src/store';

export interface UseHgmOptions {
  rawHgmBlob?: Blob | null;
}

export function useHGM({ rawHgmBlob }: UseHgmOptions) {
  const setLoading = useMainStore((s) => s.setLoading);

  const [hgm, setHGM] = useState<HGM | null>(null);

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
