export function resolveProperty(value: any) {
  return String(value).trim().replaceAll('\u0000', '');
}
