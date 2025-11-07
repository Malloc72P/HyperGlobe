export function base64ToFloat32Array(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Float32Array(bytes.buffer);
}

export function base64ToUInt32Array(base64: string): Uint32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Uint32Array(bytes.buffer);
}

export function toNumArray(typedArray: Float32Array | Uint32Array): number[] {
  return Array.from(typedArray);
}
