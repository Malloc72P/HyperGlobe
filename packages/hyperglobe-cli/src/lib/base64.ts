export function typedArrayToBase64(typedArray: Float32Array | Uint32Array): string {
  const buffer = typedArray.buffer;
  const bytes = new Uint8Array(buffer);

  return Buffer.from(bytes).toString('base64');
}
