export function calcProgress(
  elapsedTime: number,
  startTime: number,
  animationDuration: number
): number {
  const elapsed = elapsedTime - startTime;
  return Math.min(elapsed / animationDuration, 1);
}
