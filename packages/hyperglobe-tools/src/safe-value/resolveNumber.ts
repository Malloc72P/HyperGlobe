export function resolveNumber(number: number | null | undefined, fallback: number): number {
  if (number === undefined || number === null) {
    return fallback;
  }

  return number;
}

export function isSafeNumber(value: any): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
