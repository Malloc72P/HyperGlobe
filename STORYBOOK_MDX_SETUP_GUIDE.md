# Storybook + MDX 문서 시스템 설정 가이드

## 📚 개요

이 문서는 Storybook과 MDX를 사용하여 컴포넌트 문서 시스템을 구축하는 방법을 설명합니다.
Vibe 프로젝트(monday.com)의 실제 구현을 기반으로 작성되었습니다.

## 🎯 핵심 개념

### MDX와 Stories의 역할 분담

1. **MDX 파일** (`*.mdx`)
   - 문서 페이지의 콘텐츠를 담당
   - 마크다운 + JSX 컴포넌트 조합
   - 사용법, 예제, 가이드라인 등 작성

2. **Stories 파일** (`*.stories.tsx`)
   - 컴포넌트의 실제 인스턴스와 상태 정의
   - Props, argTypes 등 메타데이터 제공
   - MDX에서 참조할 스토리들 export

### 상호 연결 구조

```
Accordion.stories.tsx (데이터 제공)
         ↓ import
Accordion.mdx (문서 작성)
         ↓ 컴파일
Storybook Docs 페이지
```

## ⚙️ 설정 방법

### 1. 필수 패키지 설치

```json
{
  "devDependencies": {
    "@storybook/react-vite": "^8.6.14",
    "@storybook/addon-docs": "^8.6.14",
    "@storybook/blocks": "^8.6.14",
    "remark-gfm": "latest"
  }
}
```

### 2. Storybook 메인 설정 (`.storybook/main.ts`)

```typescript
import remarkGfm from "remark-gfm";
import type { StorybookConfig } from "@storybook/react-vite";

export default {
  // 🎯 중요: MDX와 Stories 파일 모두 포함
  stories: [
    "../src/**/*.mdx",                        // 📖 MDX 문서 파일들
    "../src/**/*.stories.@(js|jsx|ts|tsx)",   // 🧩 Stories 정의 파일들
  ],
  
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm]  // GitHub Flavored Markdown 지원
          }
        }
      }
    },
    "@storybook/addon-essentials",
    // ... 기타 애드온들
  ],
  
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
} satisfies StorybookConfig;
```

**핵심 포인트:**
- `stories` 배열에 **MDX와 Stories 파일 모두** 포함 필수
- `@storybook/addon-docs`가 MDX를 React 컴포넌트로 변환
- `remarkGfm`으로 마크다운 기능 확장

### 3. Preview 설정 (`.storybook/preview.tsx`)

```typescript
import { Preview } from "@storybook/react";
import { DocsContainer, DocsPage } from "@storybook/blocks";

const preview: Preview = {
  parameters: {
    docs: {
      container: DocsContainer,
      page: DocsPage,
      
      // 커스텀 컴포넌트 매핑
      components: {
        Canvas: CustomCanvas,        // <Canvas> 태그 커스터마이징
        PropsTable: CustomPropsTable, // <PropsTable> 커스터마이징
        h1: CustomH1,                // # 헤더 커스터마이징
        h2: CustomH2,                // ## 헤더 커스터마이징
        // 커스텀 블록들
        UsageGuidelines: CustomUsageGuidelines,
        ComponentRules: CustomComponentRules,
      }
    }
  }
};

export default preview;
```

## 📝 파일 구조 예제

### Stories 파일 작성 (`Accordion.stories.tsx`)

```typescript
import React from "react";
import { Accordion, AccordionItem } from "@vibe/core";
import type { Meta, StoryObj } from "@storybook/react";

// 메타데이터 정의
export default {
  title: "Components/Accordion",  // 🌐 URL 경로가 됨: /docs/components-accordion--docs
  component: Accordion,
  
  subcomponents: {
    AccordionItem
  },
  
  argTypes: {
    children: { control: false },
    defaultIndex: { control: false }
  },
  
  // 모든 스토리에 적용될 Decorator
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: "300px" }}>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof Accordion>;

// 개별 스토리들 (MDX에서 참조 가능)
export const Overview = {
  render: (args) => (
    <Accordion id="overview-accordion" defaultIndex={[1]} {...args}>
      <AccordionItem id="item-1" title="Notifications">
        <div style={{ height: 150 }} />
      </AccordionItem>
      <AccordionItem id="item-2" title="Setting">
        <div style={{ height: 150 }} />
      </AccordionItem>
    </Accordion>
  ),
  args: {},
  parameters: {
    docs: {
      liveEdit: { isEnabled: false }
    }
  }
};

export const MultiActive = {
  render: () => (
    <Accordion id="multi-accordion" allowMultiple defaultIndex={[0, 1]}>
      <AccordionItem id="item-1" title="First">Content 1</AccordionItem>
      <AccordionItem id="item-2" title="Second">Content 2</AccordionItem>
    </Accordion>
  ),
  name: "Multi active"
};

// 특정 스토리에만 적용될 Decorator
export const WideVersion = {
  render: () => (/* ... */),
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: "600px" }}>
        <Story />
      </div>
    )
  ]
};
```

### MDX 파일 작성 (`Accordion.mdx`)

```mdx
import { Accordion, AccordionItem } from "@vibe/core";
import { Meta, Canvas, Controls } from "@storybook/blocks";
import * as AccordionStories from "./Accordion.stories";

{/* 🔗 Stories 파일과 연결 - 이것이 핵심! */}
<Meta of={AccordionStories} />

# Accordion

Accordion is a vertically stacked list of items. Each item can be "expanded" or "collapsed".

{/* 스토리 렌더링 */}
<Canvas of={AccordionStories.Overview} />

## Import

```js
import { Accordion, AccordionItem } from "@vibe/core";
```

## Props

{/* 자동으로 Props 테이블 생성 */}
<Controls />

## Usage Guidelines

- Use accordion to reduce clutter
- Keep labels short and clear
- Default state should be closed

## Variants

### Multi Active

<Canvas of={AccordionStories.MultiActive} />

### Wide Version

<Canvas of={AccordionStories.WideVersion} />

## Accessibility

- Provide unique `id` props for each AccordionItem
- Use descriptive `title` props

## Related Components

[ExpandCollapse](#), [Table](#), [Breadcrumbs](#)
```

## 🔑 핵심 포인트 정리

### 1. Meta 태그가 모든 것을 연결

```mdx
<Meta of={AccordionStories} />
```

이 한 줄이 하는 일:
- Stories 파일의 `title`을 가져와 URL 경로 생성
- `component` 정보를 가져와 Props 자동 생성
- `argTypes` 정보를 가져와 Controls 생성
- Stories의 모든 export를 MDX에서 사용 가능하게 함

### 2. Canvas로 스토리 렌더링

```mdx
<Canvas of={AccordionStories.Overview} />
```

- Stories 파일에서 export한 스토리를 렌더링
- 자동으로 코드 보기, 전체화면 등의 기능 제공

### 3. Controls로 Props 테이블 생성

```mdx
<Controls />
```

- Stories의 `component` 메타데이터에서 자동으로 Props 추출
- TypeScript 타입 정보 기반으로 테이블 생성

### 4. Decorators의 우선순위

```typescript
// 우선순위: 낮음 → 높음
export default { decorators: [...] }  // 모든 스토리에 적용
export const Story = { decorators: [...] }  // 특정 스토리에만 적용
```

## 🎨 커스텀 컴포넌트 만들기

### UsageGuidelines 예제

```typescript
// CustomUsageGuidelines.tsx
export const UsageGuidelines = ({ guidelines }: { guidelines: React.ReactNode[] }) => {
  return (
    <div className="usage-guidelines">
      <ul>
        {guidelines.map((guideline, index) => (
          <li key={index}>{guideline}</li>
        ))}
      </ul>
    </div>
  );
};
```

### MDX에서 사용

```mdx
import { UsageGuidelines } from "custom-components";

<UsageGuidelines
  guidelines={[
    "Use accordion to reduce clutter",
    "Keep labels short and clear",
    <>Provide an <code>id</code> for accessibility</>
  ]}
/>
```

## 📁 권장 파일 구조

```
src/
  components/
    Accordion/
      Accordion.tsx              # 실제 컴포넌트
      Accordion.stories.tsx      # Storybook 스토리들
      Accordion.mdx              # 문서 페이지
      Accordion.interactions.ts  # 인터랙션 테스트
      
.storybook/
  main.ts                        # Storybook 메인 설정
  preview.tsx                    # Preview 설정 (decorators, parameters)
```

## 🚀 실행 명령어

```bash
# 개발 모드로 Storybook 실행
pnpm storybook

# Storybook 빌드
pnpm build-storybook

# 빌드된 Storybook 배포
pnpm deploy-storybook
```

## 🔍 트러블슈팅

### MDX 파일이 인식되지 않을 때

```typescript
// main.ts의 stories 배열 확인
stories: [
  "../src/**/*.mdx",  // ✅ 이 패턴이 있는지 확인
]
```

### Props 테이블이 생성되지 않을 때

```typescript
// Stories 파일에서 component 지정 확인
export default {
  component: Accordion,  // ✅ 실제 컴포넌트 전달
}
```

### Canvas에서 스토리가 렌더링되지 않을 때

```mdx
{/* Stories 파일 import 확인 */}
import * as AccordionStories from "./Accordion.stories";

{/* of 속성에 올바른 스토리 참조 */}
<Canvas of={AccordionStories.Overview} />
```

### Decorators가 적용되지 않을 때

```typescript
// decorators는 함수 배열이어야 함
decorators: [
  (Story: React.ComponentType) => <div><Story /></div>  // ✅
]

// ❌ 잘못된 예
decorators: (Story) => <div><Story /></div>
```

## 📚 참고 자료

- [Storybook Docs 공식 문서](https://storybook.js.org/docs/react/writing-docs/introduction)
- [MDX 공식 문서](https://mdxjs.com/)
- [Storybook Blocks API](https://storybook.js.org/docs/react/api/doc-blocks)

## 💡 Best Practices

1. **파일 네이밍**: `ComponentName.stories.tsx`와 `ComponentName.mdx`를 같은 폴더에 배치
2. **Meta 연결**: MDX 파일은 항상 `<Meta of={Stories} />`로 시작
3. **스토리 재사용**: MDX에서 여러 스토리를 Canvas로 보여주기
4. **타입 안정성**: Stories 파일에서 `Meta<typeof Component>` 사용
5. **Decorators 활용**: 공통 레이아웃은 default export에, 특수한 경우만 개별 스토리에
6. **접근성**: 모든 인터랙티브 요소에 `id` 제공

---

## 🎯 Copilot에게 질문할 때 유용한 프롬프트

```
"Storybook MDX 문서 시스템을 설정하려고 합니다. 
위 STORYBOOK_MDX_SETUP_GUIDE.md를 참고하여 다음을 도와주세요:

1. .storybook/main.ts 설정 생성
2. [ComponentName].stories.tsx 파일 작성
3. [ComponentName].mdx 문서 작성
4. 커스텀 문서 블록 컴포넌트 만들기

현재 프로젝트 구조는 [...] 입니다."
```

이 가이드를 참조하면 Storybook + MDX 문서 시스템을 쉽게 구축할 수 있습니다! 🚀
