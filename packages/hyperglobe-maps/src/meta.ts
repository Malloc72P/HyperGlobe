export const MapMeta = {
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
        simplifyPercent: 90,
        precision: 0.0001,
      },
    ],
  },
};
