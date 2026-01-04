# Storybook 작성 가이드

## 개요

HyperGlobe 프로젝트는 **MDX 기반 Storybook 문서화**를 사용합니다. 각 컴포넌트는 스토리 파일(`.stories.tsx`)과 가이드 파일(`.guide.mdx`)을 함께 작성하여, 인터랙티브 예제와 상세 설명을 통합합니다.

## 파일 구조

각 컴포넌트 디렉토리는 다음과 같은 구조를 가집니다:

```
src/components/hyperglobe/
  ├── hyperglobe.tsx           # 컴포넌트 구현
  ├── hyperglobe.stories.tsx   # 스토리 정의 (예제별 args)
  ├── hyperglobe.guide.mdx     # MDX 가이드 (문서화)
  └── index.ts                 # export
```

## 핵심 개념: Stories + MDX 가이드

### Stories 파일 (`.stories.tsx`)

스토리 파일은 **개별 예제 시나리오**를 정의합니다. 각 스토리는 특정 props 조합을 보여줍니다.

```tsx
// hyperglobe.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HyperGlobe } from './hyperglobe';

const meta = {
  title: 'Components/HyperGlobe',
  component: HyperGlobe,
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 예제
export const Intro: Story = {
  name: '기본 사용법',
  args: {
    hgmUrl: 'https://unpkg.com/@malloc72p/hyperglobe-maps/dist/nations-mid.hgm',
    globe: { style: { color: '#1a1a2e' } },
  },
};

// 지구본 스타일 예제
export const Globe: Story = {
  name: '지구본 스타일',
  args: {
    hgmUrl: 'https://unpkg.com/@malloc72p/hyperglobe-maps/dist/nations-mid.hgm',
    globe: {
      style: { color: '#2d3748', roughness: 0.8, metalness: 0.2 },
      wireframe: false,
    },
  },
};

// 카메라 설정 예제
export const Camera: Story = {
  name: '카메라 설정',
  args: {
    hgmUrl: 'https://unpkg.com/@malloc72p/hyperglobe-maps/dist/nations-mid.hgm',
    camera: {
      initialPosition: [126.978, 37.5665], // 서울
      minDistance: 2,
      maxDistance: 8,
    },
  },
};
```

### MDX 가이드 파일 (`.guide.mdx`)

가이드 파일은 **스토리를 가져와서 문서 내에서 렌더링**합니다. 이를 통해 설명과 예제를 자연스럽게 통합할 수 있습니다.

```mdx
// hyperglobe.guide.mdx
import {
  Meta,
  Description,
  Canvas,
  Title,
  Controls,
} from '@storybook/addon-docs/blocks';
import { HyperGlobe } from './hyperglobe';
import * as HyperGlobeExamples from './hyperglobe.stories';

<Meta title="Components/HyperGlobe" of={HyperGlobeExamples} />

<Title>HyperGlobe</Title>

<Description of={HyperGlobe} />

### 사용 예시

<Canvas of={HyperGlobeExamples.Intro} />

## 지구본 스타일

`globe` 속성으로 지구본의 색상, 재질 등을 설정할 수 있습니다.

<Canvas of={HyperGlobeExamples.Globe} />

## 카메라 설정

`camera` 속성으로 초기 카메라 위치와 줌 범위를 설정합니다.

<Canvas of={HyperGlobeExamples.Camera} />
<Controls of={HyperGlobeExamples.Camera} />
```

## MDX 주요 컴포넌트

### `<Canvas>`

스토리를 렌더링하고 소스 코드를 함께 표시합니다.

```mdx
<Canvas of={HyperGlobeExamples.Intro} />
```

- `of`: 스토리 객체 참조
- "Show code" 버튼으로 소스 코드 확인 가능

### `<Controls>`

해당 스토리의 props를 인터랙티브하게 조작할 수 있는 컨트롤을 표시합니다.

```mdx
<Canvas of={HyperGlobeExamples.Camera} />
<Controls of={HyperGlobeExamples.Camera} />
```

### `<Description>`

컴포넌트의 JSDoc 주석을 가져와 표시합니다.

```mdx
<Description of={HyperGlobe} />
```

### `<Title>`

문서 제목을 표시합니다.

```mdx
<Title>HyperGlobe</Title>
```

### `<Meta>`

문서의 메타데이터를 설정합니다. 스토리 파일과 연결합니다.

```mdx
<Meta title="Components/HyperGlobe" of={HyperGlobeExamples} />
```

## 작성 패턴

### 1. 기능별 스토리 분리

각 주요 기능/속성별로 별도의 스토리를 만들어 MDX에서 참조합니다.

```tsx
// stories.tsx
export const Intro: Story = { ... };
export const Globe: Story = { ... };
export const Camera: Story = { ... };
export const Controls: Story = { ... };
export const Graticule: Story = { ... };
export const Region: Story = { ... };
```

```mdx
// guide.mdx
## 기본 사용법
<Canvas of={Examples.Intro} />

## 지구본 설정
<Canvas of={Examples.Globe} />

## 카메라 설정
<Canvas of={Examples.Camera} />
<Controls of={Examples.Camera} />
```

### 2. 섹션별 상세 설명

각 섹션에서 기능을 설명하고, 관련 스토리를 바로 보여줍니다.

```mdx
## HGM 파일

- HyperGlobe 전용 지도 파일 형식입니다.
- `@hyperglobe/cli` 도구로 GeoJSON을 HGM으로 변환합니다.

### CLI 사용법

```bash
npx @hyperglobe/cli convert -i input.geojson -o output.hgm
```

### 기본 제공 지도

```plaintext
https://cdn.jsdelivr.net/npm/@hyperglobe/maps@latest/nations-mid.hgm
```
```

### 3. 인터랙티브 컨트롤 활용

각 스토리에 `<Controls>`를 추가하면 사용자가 직접 옵션을 조절하며 테스트할 수 있습니다.
모든 스토리에 `<Controls>`를 추가하여 인터랙티브한 문서를 제공하세요.

```mdx
### 기본 사용법

<Canvas of={Examples.Basic} />

<Controls of={Examples.Basic} />

### 스타일 커스터마이징

<Canvas of={Examples.Styled} />

<Controls of={Examples.Styled} />
```

### 4. 관련된 Arg만 노출하기

특정 스토리에서 불필요한 컨트롤을 숨기고, 관련된 Arg만 노출하여 사용자가 집중할 수 있도록 합니다.
`parameters.controls.include` 배열에 노출할 Arg의 이름을 문자열로 나열합니다.

```tsx
export const MyStory: Story = {
  args: {
    // ...
  },
  parameters: {
    controls: {
      include: ['relevantArg1', 'relevantArg2'],
    },
  },
};
```

## 스토리 작성 팁

### argTypes로 컨트롤 커스터마이징

```tsx
export const Size: Story = {
  args: {
    size: 500,
  },
  argTypes: {
    size: {
      control: { type: 'range', min: 200, max: 800, step: 50 },
    },
  },
};
```

### 소스 코드 커스터마이징

복잡한 스토리의 경우 간소화된 예제 코드를 표시할 수 있습니다.

```tsx
export const ComplexExample: Story = {
  parameters: {
    docs: {
      source: {
        code: `
<HyperGlobe
  hgmUrl="https://unpkg.com/@malloc72p/hyperglobe-maps/dist/world.hgm"
  region={{ style: { fillColor: 'blue' } }}
/>
`,
      },
    },
  },
};
```

## 카테고리 구조

```
Components/          ← 기본 컴포넌트
  HyperGlobe
  
Hooks/              ← 훅
  useColorScale
  useHGM

Demo/               ← 복합 예제
  Nations
  Routes
```

## 주의사항

### 1. 색상 사용 규칙

- `Colors` 객체에 정의되지 않은 색상은 사용하지 마세요.
- 프로젝트의 일관된 디자인 시스템을 유지하기 위해 정의된 색상 팔레트만 사용해야 합니다.
- `Colors` 객체에 존재하지 않는 색상(예: `Colors.RED`)을 사용하면 타입 에러가 발생합니다.

### 2. 타입 에러 체크

- 코드를 작성한 후에는 반드시 타입 에러가 없는지 확인하세요.
- 특히 `Colors` 객체 사용 시 자동완성이 되지 않는 속성은 존재하지 않는 것입니다.
- `pnpm type-check` 명령어나 에디터의 오류 표시를 통해 검증해야 합니다.

### 3. autodocs 태그 사용 금지

- `.stories.tsx` 파일에서 `tags: ['autodocs']`를 사용하지 마세요.
- 현재 프로젝트는 `.guide.mdx` 파일을 통해 커스텀 문서화 페이지를 생성하고 있습니다.
- `autodocs` 태그를 추가하면 자동 생성된 문서 페이지와 충돌하거나 에러가 발생할 수 있습니다.

### 4. Description 블록 사용 규칙

- `.guide.mdx` 파일에서 `<Description of={...} />` 블록을 사용하지 마세요.
- 스토리에서 `HyperGlobe` 컴포넌트를 기반으로 사용하기 때문에, 코어 컴포넌트(예: `Graticule`, `MarkerFeature`)를 `Description`의 `of` 속성에 전달하면 올바른 설명이 표시되지 않습니다.
- 대신, MDX 파일의 "개요" 섹션에 직접 마크다운으로 컴포넌트 설명을 작성하세요.

## 체크리스트

새로운 컴포넌트 문서를 작성할 때:

- [ ] `.stories.tsx` 파일에 기능별 스토리 정의
- [ ] `.guide.mdx` 파일에 MDX 가이드 작성
- [ ] `<Meta>` 태그로 스토리 파일 연결
- [ ] 각 섹션에 `<Canvas of={...}>` 로 스토리 렌더링
- [ ] 인터랙티브 예제에 `<Controls of={...}>` 추가
- [ ] 컴포넌트 JSDoc에 설명 작성 (`<Description>` 용)

## 로컬 실행

```bash
# Storybook 개발 서버 실행
pnpm storybook

# Storybook 빌드
pnpm build-storybook
```

## 참고 예시

현재 프로젝트에서 MDX 기반 문서화가 적용된 컴포넌트:

- `src/components/hyperglobe/hyperglobe.guide.mdx`

## 참고 자료

- [Storybook MDX 문서](https://storybook.js.org/docs/writing-docs/mdx)
- [Storybook Doc Blocks](https://storybook.js.org/docs/writing-docs/doc-blocks)

## 관련 문서

- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [ColorScale 시스템](./colorscale.md)
