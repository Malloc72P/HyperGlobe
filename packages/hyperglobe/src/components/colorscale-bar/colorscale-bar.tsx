import type { ColorScaleModel } from 'src/types/colorscale';
import classes from './colorscale-bar.module.css';
import { ColorScaleStep } from './colorscale-step';
import { useMarkerPosition } from './use-marker-position';

export type ColorScaleLabelFormatter = (value: number) => string;

/**
 * 컬러스케일 바 컴포넌트
 *
 * - 컬러스케일 모델을 시각적으로 표시하는 막대 컴포넌트입니다.
 */
export interface ColorScaleBarProps {
  /**
   * 컬러스케일 모델
   *
   * useColorScale 훅을 사용하여 생성한 모델을 전달합니다.
   */
  colorScale: ColorScaleModel;
  /**
   * 컬러스케일 루트 스타일
   */
  style?: React.CSSProperties;
  /**
   * 컬러스케일 레이블 포맷터 함수
   */
  formatLabel?: ColorScaleLabelFormatter;
}

export function ColorScaleBar({
  style,
  colorScale,
  formatLabel = (value) => value.toFixed(0),
}: ColorScaleBarProps) {
  const [markerPosition] = useMarkerPosition({ colorScale });

  return (
    <div className={classes.root} style={style}>
      {/* 마커 & 마커 컨테이너 */}
      <div className={classes.markerContainer}>
        <div
          className={classes.marker}
          hidden={markerPosition === -1}
          style={{ left: `${markerPosition}%` }}
        ></div>
      </div>

      {/* 스텝 & 레이블 */}
      {colorScale.steps.map((step) => (
        <ColorScaleStep
          key={step.id}
          colorscale={colorScale}
          step={step}
          formatLabel={formatLabel}
        />
      ))}
    </div>
  );
}
