export function roundCoordinates(coord: number, precision: number = 5): number {
  return Math.round(coord * Math.pow(10, precision)) / Math.pow(10, precision);
}
