import { useRef, useState } from 'react';
import { HyperGlobe } from '../../../src';
import { Colors } from '../../lib';
import type { HyperglobeRef } from '../../types/camera';
import { StoryButton } from '../../../.storybook/ui/story-button';
import classes from './camera-transition-demo.module.css';

/**
 * 카메라 트랜지션 데모
 *
 * - 지정된 경로를 따라 카메라가 자동으로 이동합니다.
 * - 대권항로(Great Circle)를 따라 부드럽게 이동합니다.
 */
export function CameraTransitionDemo() {
  const hyperglobeRef = useRef<HyperglobeRef>(null);
  const [currentPoint, setCurrentPoint] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  const startBasicTransition = () => {
    setIsAnimating(true);
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
        },
        onComplete: () => {
          setIsAnimating(false);
        },
      }
    );
  };

  const cancel = () => {
    hyperglobeRef.current?.cancelTransition();
    setIsAnimating(false);
    setCurrentPoint(-1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <HyperGlobe
        ref={hyperglobeRef}
        hgmUrl="https://unpkg.com/@malloc72p/hyperglobe-maps/dist/nations-mid.hgm"
        id="hyperglobe-canvas"
        size="100%"
        maxSize={900}
        style={{ margin: '0 auto', maxWidth: 400 }}
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
      />

      <div className={classes.controls}>
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
          <div>{isAnimating ? '이동 중' : '대기'}</div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <StoryButton onClick={startBasicTransition} disabled={isAnimating}>
            카메라 이동 시작
          </StoryButton>

          <StoryButton onClick={cancel} disabled={!isAnimating} variant="secondary">
            취소
          </StoryButton>
        </div>
      </div>
    </div>
  );
}
