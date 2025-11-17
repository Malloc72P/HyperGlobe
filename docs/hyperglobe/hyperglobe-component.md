# HyperGlobe 컴포넌트

## 개요

`HyperGlobe`는 WebGL 기반 3D 지구본을 렌더링하는 루트 컴포넌트입니다. Three.js와 React Three Fiber를 기반으로 구현되었습니다.

## 주요 기능

### 기본 렌더링
- WebGL Canvas를 통한 3D 지구본 렌더링
- OrbitControls를 통한 카메라 조작 (회전, 줌)
- 조명 설정 (DirectionalLight)

### 자식 컴포넌트 시스템
- `HyperGlobe` 컴포넌트만 사용하면 빈 지구본이 렌더링됩니다
- 다양한 피쳐 컴포넌트를 자식으로 추가하여 지구본을 구성합니다:
  - `RegionFeature`: 국가/지역 폴리곤
  - `Graticule`: 경위선 격자
  - `LineFeature`: 선 피쳐
  - 기타 3D 오브젝트

### 인터랙션
- 툴팁 시스템: 호버 시 정보 표시
- 호버 이벤트: `onHoverChanged` 콜백을 통한 이벤트 처리
- 로딩 UI: 데이터 로딩 중 표시

### 성능 모니터링
- FPS 카운터 (선택적 표시)

## Props

### 레이아웃 관련
- `id`: Canvas 요소의 id
- `size`: 지구본 크기 (기본값: '100%')
- `maxSize`: 최대 크기
- `style`: Canvas 스타일

### 지구본 스타일
- `globeStyle`: 지구본 공통 스타일 설정
- `wireframe`: 와이어프레임 모드

### UI 옵션
- `loading`: 로딩 UI 표시 여부
- `tooltipOptions`: 툴팁 설정
- `showFpsCounter`: FPS 카운터 표시 여부

### 이벤트
- `onHoverChanged`: 호버된 지역 변경 시 호출

## 사용 예시

### 기본 사용
```tsx
import { HyperGlobe } from 'hyperglobe';

function App() {
  return (
    <HyperGlobe size="800px">
      {/* 자식 컴포넌트 추가 */}
    </HyperGlobe>
  );
}
```

### 피쳐와 함께 사용
```tsx
import { HyperGlobe, RegionFeature, Graticule } from 'hyperglobe';

function App() {
  return (
    <HyperGlobe size="800px">
      <Graticule />
      {features.map(feature => (
        <RegionFeature key={feature.id} feature={feature} />
      ))}
    </HyperGlobe>
  );
}
```

### 호버 이벤트 처리
```tsx
function App() {
  const handleHoverChange = (region) => {
    console.log('Hovered region:', region);
  };

  return (
    <HyperGlobe 
      size="800px"
      onHoverChanged={handleHoverChange}
    >
      {/* 자식 컴포넌트 */}
    </HyperGlobe>
  );
}
```

## 기술 세부사항

### 렌더링 파이프라인
1. React Three Fiber의 `Canvas` 컴포넌트로 WebGL 컨텍스트 생성
2. `OrbitControls`로 카메라 제어 설정
3. `Globe` 컴포넌트로 지구본 구체 렌더링
4. 자식 컴포넌트들이 Three.js 씬에 추가됨

### 색상 공간 설정
- `outputColorSpace`: SRGBColorSpace
- `gl.outputColorSpace`: LinearSRGBColorSpace
- `toneMapping`: NoToneMapping

이 설정은 색상 재현의 정확성과 일관성을 보장합니다.

### 상태 관리
- Zustand 기반 메인 스토어 사용
- 툴팁, 호버 상태 등을 전역으로 관리

## 관련 문서
- [RegionFeature 컴포넌트](./region-feature.md)
- [Graticule 컴포넌트](./graticule.md)
- [ColorScale 시스템](./colorscale.md)
- [수학 라이브러리](./math-libraries.md)
