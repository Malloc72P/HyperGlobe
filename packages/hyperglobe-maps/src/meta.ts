export interface MapResolution {
  resolution: string;
  simplifyPercent: number;
  precision: number;
}

export interface MapMeta {
  defaultResolution: Pick<MapResolution, 'simplifyPercent'>;
  resolutions: MapResolution[];
}

export const MapList = ['nations'] as const;
export type MapListType = (typeof MapList)[number];

export type BuildMapMetaType = {
  [k in MapListType]: MapMeta;
};

export const BuildMapMeta: BuildMapMetaType = {
  nations: {
    defaultResolution: {
      simplifyPercent: 40,
    },
    resolutions: [
      {
        resolution: 'extra-low',
        simplifyPercent: 5,
        precision: 0.0001,
      },
      {
        resolution: 'low',
        simplifyPercent: 15,
        precision: 0.0001,
      },
      {
        resolution: 'mid',
        simplifyPercent: 30,
        precision: 0.0001,
      },
      {
        resolution: 'high',
        simplifyPercent: 60,
        precision: 0.0001,
      },
      {
        resolution: 'extra-high',
        simplifyPercent: 70,
        precision: 0.0001,
      },
    ],
  },
} as const;
