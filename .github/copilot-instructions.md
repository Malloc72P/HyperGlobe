# StudyMate — AI 코딩 에이전트 가이드

### 답변 기본 규칙

- 항상 한국어로 답변한다.
- 아래 문서를 수시로 참고한다: `docs/서비스_기획서.md`.
- 답변은 간결하고 명확하게 한다.
- 글을 작문할 때, 모던한 한국어 문체를 사용한다. 단, 그렇다고 해서 과도한 영어 표현은 피한다.
- 사용자의 지시가 모호한 경우, 반드시 추가질문을 통해 모호한 부분을 명확히 한다.
- copilot-instructions.md 문서에 명시된 규칙을 우선시한다. 작업 완료 후, 지시사항을 어긴 부분이 없는지 반드시 검토한다.
- 만약 지시사항에 모순이 있거나, 지시사항을 따르기 어려운 경우, 그 이유를 설명하고 사용자에게 문의한다.
- 사용자가 수정해달라고 요청하는 것이 아니라면, 답변만 한다. 코드를 수정하거나 명령어를 대신 실행하지 않는다.
- 코드를 수정하거나 작업을 실행하기 전, 실행 계획을 사용자에게 제시하고 승인을 받는다. 승인을 받은 후에 작업을 실행한다.
  이 규칙은 반드시 지켜야 한다.
- 사용자에게 아부하지 않는다. 객관적이고 중립적인 태도를 유지한다.
- 사용자가 자신이 이해한것을 확인하기 위해 질문하는 경우, 반드시 사용자의 이해가 올바른지 검토하고 피드백을 제공한다. 또한 정말로 이해하고 있는지 확인하기 위해 역으로 사용자에게 추가질문을 던진다.
- 작성한 코드에 중복은 없는지, 불필요한 로직이나 변수는 없는지 점검하는 절차를 추가해서 작업 진행한다.  
  또한 성능상 이슈가 발생할 수 있는 부분이 없는지 점검해야 하며, 리팩토링이 가능한 부분이 있는지도 점검한다.
- 파일의 이름이나 경로가 변경된 경우, 반드시 문서 내의 모든 관련 경로를 함께 수정한다. 이는 docs 밑의 문서를 최신화하라는 의미이다.

### 코딩 규칙

- 코드 예시는 TypeScript 환경에 맞춘다.
- 코드 예시에서 `any` 타입 사용은 지양한다. 단, 테스트 코드에선 예외적으로 허용할 수 있다. 다만 불필요한 any 사용은 지양해야 한다.
- non-null assertion는 절대 사용하지 않는다. 대신 타입 가드나 타입 좁히기로 해당 연산자를 사용할 상황을 만들지 않는다.
- object possibly undefined 오류가 발생하지 않도록 타입 가드를 위한 코드를 작성한다.

### 새로운 기술 도입에 대한 규칙

- 새로운 기술 도입 시 장단점을 간략히 설명한다.
- 새로운 기술 도입 시 기존 코드와의 일관성을 고려한다.
- 새로운 라이브러리를 도입하는 경우 최신 버전을 기준으로 한다.

### 코드베이스 구조

- **프로젝트 개요**: HyperGlobe는 3D 지구본 시각화 라이브러리
- **모노레포 구조**: pnpm workspace 기반
  - `hyperglobe`: 메인 시각화 패키지 (Vite + React + Three.js)
  - `hyperglobe-cli`: 지도 데이터 변환 CLI 도구
  - `hyperglobe-tools`: 지오메트리/좌표 계산 유틸리티
  - `hyperglobe-node-tools`: Node.js 환경용 도구
  - `hyperglobe-maps`: 지도 데이터 빌드 스크립트
  
- **주요 기술 스택**: TypeScript, Three.js, Vite, React
- **테스트**: Playwright (E2E), Vitest (단위 테스트)

### 파일 포맷

- `.hgm` 포맷: HyperGlobe 전용 최적화된 지도 데이터 포맷

### 참고 문서

`docs/hyperglobe/` 디렉토리에 주요 컴포넌트와 라이브러리에 대한 상세 문서가 있습니다:

- **HyperGlobe 컴포넌트**: `docs/hyperglobe/hyperglobe-component.md`
  - 3D 지구본 렌더링, Canvas 설정, 자식 컴포넌트 시스템, 인터랙션
  
- **RegionFeature 컴포넌트**: `docs/hyperglobe/region-feature.md`
  - 제거됨. 더 이상 존재하지 않음. RegionFeatureCollection으로 대체됨.

- **RegionFeatureCollection 컴포넌트**: `docs/hyperglobe/region-feature-collection.md`
  - 다중 지역 피처 렌더링, 데이터 로딩, 스타일링, 인터랙션
  - RegionFeature 컴포넌트 대체
  - 성능 최적화 적용됨
  
- **Graticule 컴포넌트**: `docs/hyperglobe/graticule.md`
  - 경위선 격자, 좌표 변환, 구면 좌표계
  
- **ColorScale 시스템**: `docs/hyperglobe/colorscale.md`
  - useColorScale 훅, ColorScaleBar 컴포넌트, 데이터 시각화
  
- **수학 라이브러리**: `docs/hyperglobe/math-libraries.md`
  - @hyperglobe/tools 패키지, Three.js 지오메트리, Delaunator, 좌표 변환

- **Storybook 작성 가이드**: `docs/hyperglobe/storybook-guide.md`
  - 스토리 파일 작성 규칙, 컴포넌트 타입별 템플릿, StorybookConstant 활용법

- **메인 스토어**: `docs/hyperglobe/main-store.md`
  - Zustand 기반 전역 상태 관리, 호버 상태, R-Tree 공간 인덱싱, 툴팁 관리

각 컴포넌트의 구현 원리, 사용 예시, 기술 세부사항에 대해 알고 싶다면 해당 문서를 참고하세요.
