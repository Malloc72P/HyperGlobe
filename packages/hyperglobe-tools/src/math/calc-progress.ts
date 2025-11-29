export function calcProgress(
  elapsedTime: number,
  startTime: number,
  animationDuration: number
): number {
  const elapsed = elapsedTime - startTime;
  const durationSeconds = animationDuration / 1000;
  return Math.min(elapsed / durationSeconds, 1);
}
