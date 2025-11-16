export class MathConstants {
  /**
   * 피쳐 스트로크 Z-인덱스 값입니다.
   *
   * 피쳐 외곽선은 구체와 면(메쉬)보다 약간 위에 렌더링되어야 함.
   */
  public static FEATURE_STROKE_Z_INDEX = 1.0015;

  /**
   * 피쳐의 면에 해당하는 메쉬를 위한 Z-인덱스 값.
   *
   * 피쳐 면(메쉬)은 구체보다 약간 위에 렌더링되어야 함.
   * 하지만 피쳐 외곽선보다는 아래에 렌더링되어야 함.
   */
  public static FEATURE_FILL_Z_INDEX = 1.001;
}
