# Hyperglobe

## 소개

- Hyperglobe는 React와 Three.js 기반 3D 맵차트 라이브러리 입니다.
- 웹 환경에서 인터랙티브한 3D 지구본과 지리 데이터를 시각화하는 데 최적화되어 있습니다.
- [데모 보러가기](https://hyperglobe.malloc72p.com)

## 특징

- **고성능**: WebGL 기반의 렌더링으로 부드러운 3D 그래픽 제공
- **사용자 정의 가능**: 다양한 옵션을 통해 지구본의 외형과 동작을 커스터마이징 가능
- **데이터 시각화**: 지구본 위에 다양한 형태의 데이터 시각화 지원
- **반응형 디자인**: 다양한 화면 크기와 해상도에 최적화된 반응형 디자인 지원
- **라우트 시각화**: 경로 데이터를 시각적으로 표현하는 기능 제공
- **애니메이션**: 지구본과 데이터에 다양한 애니메이션 효과 적용 가능

## 설치

```bash
# npm
npm install @malloc72p/hyperglobe

# pnpm
pnpm add @malloc72p/hyperglobe

# yarn
yarn add @malloc72p/hyperglobe
```

### Peer Dependencies

이 라이브러리는 다음 패키지들을 peer dependency로 요구합니다. 프로젝트에 설치되어 있지 않다면 함께 설치해주세요:

```bash
npm install react react-dom three @react-three/fiber @react-three/drei
```

### 코드 예시

```tsx
'use client';

import { HyperGlobe } from '@malloc72p/hyperglobe';
import '@malloc72p/hyperglobe/hyperglobe.css';

export default function Page() {
  return (
    <div>
      <HyperGlobe
        hgmUrl="https://unpkg.com/@malloc72p/hyperglobe-maps/dist/nations-mid.hgm"
        maxSize={600}
      />
    </div>
  );
}
```

### 기여자를 위한 정보

| 이름 | 버전 | 
| pnpm | 10.11.0 |
| node | 22.20.0 | 
| turbo | 2.5.4 |

- pnpm 패키지 매니져를 사용합니다.
- 모노레포 구조입니다.
  - 라이브러리 코어 및 cli, 공통 모듈은 packages 폴더 밑에 있습니다.
  - E2E Test Project, Example은 apps 폴더 밑에 있습니다.
  - Example은 준비중입니다.
- docs 폴더 밑에 HyperGlobe 프로젝트에 대한 설명이 있습니다.
  - Copilot을 사용하는 경우, 해당 폴더의 문서를 읽고 답변하도록 설정되어 있습니다.
  - Copilot 외 다른 AI 에이전트를 사용하시는 경우, .github/copilot-instructions.md를 참고하여 docs 문서를 읽고 답변하도록 설정해주세요. 그러면 에이전트가 라이브러리의 맥락을 이해하고 답변할 수 있습니다.

## 만든이

- [개발자 블로그](https://blog.malloc72p.com)
- 개발자 이메일: scra1028@gmail.com