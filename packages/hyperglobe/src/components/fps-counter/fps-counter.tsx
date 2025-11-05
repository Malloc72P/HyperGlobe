import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/**
 * FPS(초당 프레임 수)를 계산하는 컴포넌트
 *
 * - Canvas 내부에서 useFrame을 사용하여 매 프레임마다 FPS를 계산합니다.
 * - 계산된 FPS를 콜백으로 전달합니다.
 */
export function FpsCounter({ onFpsUpdate }: { onFpsUpdate: (fps: number) => void }) {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useFrame(() => {
    frameCountRef.current += 1;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTimeRef.current;

    // 500ms마다 FPS 업데이트 (너무 자주 업데이트하면 화면이 깜빡거림)
    if (elapsed >= 500) {
      const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
      onFpsUpdate(currentFps);
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
  });

  return null;
}

/**
 * FPS를 표시하는 HTML 오버레이 컴포넌트
 *
 * @param fps - 표시할 FPS 값
 */
export function FpsDisplay({ fps }: { fps: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        padding: '4px 8px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: fps >= 50 ? '#4ade80' : fps >= 30 ? '#facc15' : '#f87171',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        borderRadius: '4px',
        zIndex: 1000,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {fps} FPS
    </div>
  );
}
