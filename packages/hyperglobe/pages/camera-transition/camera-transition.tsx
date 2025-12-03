import { useRef, useState } from 'react';
import { HyperGlobe, Colors, HyperglobeRef } from '../../src';

export interface CameraTransitionDemoProps {}

/**
 * 카메라 트랜지션 데모
 *
 * - 지정된 경로를 따라 카메라가 자동으로 이동합니다.
 * - 대권항로(Great Circle)를 따라 부드럽게 이동합니다.
 */
export function CameraTransitionDemo() {
  const hyperglobeRef = useRef<HyperglobeRef>(null);
  const [progress, setProgress] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  const startBasicTransition = () => {
    setIsAnimating(true);
    setProgress(0);
    setCurrentPoint(-1);

    hyperglobeRef.current?.followPath(
      [
        { coordinate: [127, 37], duration: 2000 }, // 서울
        { coordinate: [-122, 37], duration: 3000 }, // 샌프란시스코
        { coordinate: [-74, 40], duration: 2500 }, // 뉴욕
      ],
      {
        lockCamera: true,
        onPathPointReached: (index) => {
          setCurrentPoint(index);
          console.log(`도착: 지점 ${index + 1}`);
        },
        onComplete: () => {
          setIsAnimating(false);
          console.log('투어 완료!');
        },
      }
    );
  };

  const cancel = () => {
    hyperglobeRef.current?.cancelTransition();
    setIsAnimating(false);
    setProgress(0);
    setCurrentPoint(-1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={startBasicTransition} disabled={isAnimating}>
          기본 트랜지션 (3개 지점)
        </button>

        <button onClick={cancel} disabled={!isAnimating}>
          취소
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
        <div>
          <strong>진행률:</strong> {progress}%
        </div>
        <div>
          <strong>현재 지점:</strong> {currentPoint >= 0 ? currentPoint + 1 : '-'}
        </div>
        <div>
          <strong>상태:</strong> {isAnimating ? '이동 중' : '대기'}
        </div>
      </div>

      <HyperGlobe
        ref={hyperglobeRef}
        hgmUrl="/maps/nations-mid.hgm"
        id="hyperglobe-canvas"
        size="100%"
        maxSize={900}
        style={{ margin: '0 auto' }}
        globe={{
          style: {
            color: Colors.GRAY[1],
            metalness: 0,
            roughness: 0,
          },
        }}
        graticule
        region={{
          style: {
            color: Colors.GRAY[7],
            fillColor: Colors.GRAY[3],
          },
          hoverStyle: {
            color: Colors.GRAY[8],
            fillColor: Colors.GRAY[3],
          },
        }}
        onReady={() => {
          console.log('카메라 트랜지션 데모 렌더링 완료');
        }}
      />
    </div>
  );
}
