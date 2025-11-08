/**
 * 바이트를 메가바이트(MB)로 변환합니다.
 * @param bytes 변환할 바이트 수
 * @param decimals 소수점 자릿수 (기본값: 2)
 * @returns MB 단위 문자열
 */
export function formatBytesToMB(bytes: number, decimals: number = 2): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(decimals)} MB`;
}
