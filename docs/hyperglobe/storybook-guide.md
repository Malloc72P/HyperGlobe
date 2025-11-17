# Storybook 작성 가이드

## 개요

HyperGlobe 프로젝트는 Storybook을 사용하여 컴포넌트 문서화 및 시각적 테스트를 제공합니다. 이 문서는 새로운 스토리를 작성할 때 따라야 할 가이드라인을 제공합니다.

## 기본 구조

### 1. 파일 위치

스토리 파일은 컴포넌트와 같은 디렉토리에 위치시킵니다.

```
src/components/graticule/
  ├── graticule.tsx
  ├── graticule.stories.tsx  ← 스토리 파일
  └── index.ts
```

### 2. 기본 템플릿

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentName } from './component-name';

const meta = {
  title: 'Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicStory: Story = {
  name: 'ComponentName',
  args: {
    // props 기본값
  },
};
```

## 컴포넌트 타입별 작성 방법

### 1. 일반 컴포넌트 (Graticule, PolygonFeature 등)

HyperGlobe 자식 컴포넌트는 반드시 `decorators`로 HyperGlobe를 래핑해야 합니다.

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HyperGlobe } from '../..';
import { StorybookConstant } from '../../constants/storybook-constant';
import { Graticule } from './graticule';

const meta = {
  title: 'Components/Graticule',
  component: Graticule,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <HyperGlobe {...StorybookConstant.props.HyperGlobe}>
        {Story()}
      </HyperGlobe>
    ),
  ],
} satisfies Meta<typeof Graticule>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GraticuleStory: Story = {
  name: 'Graticule',
  args: {
    latitudeStep: 10,
    longitudeStep: 10,
  },
};
```

**주요 포인트:**
- `decorators`에서 HyperGlobe로 래핑
- `StorybookConstant.props.HyperGlobe`로 일관된 기본값 사용
- 필요시 `globeStyle` 커스터마이징 가능

### 2. 루트 컴포넌트 (HyperGlobe)

루트 컴포넌트는 decorators 없이 직접 렌더링합니다.

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StorybookConstant } from '../../constants';
import { HyperGlobe } from './hyperglobe';
import { Colors } from '../../lib/colors';

const meta = {
  title: 'Components/HyperGlobe',
  component: HyperGlobe,
} satisfies Meta<typeof HyperGlobe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HyperGlobeStory: Story = {
  name: 'HyperGlobe',
  tags: ['autodocs'],
  args: {
    ...StorybookConstant.props.HyperGlobe,
    globeStyle: {
      color: Colors.BLUE[4],
    },
  },
  argTypes: {
    children: {
      table: {
        disable: true,  // children prop을 컨트롤에서 숨김
      },
    },
  },
};
```

**주요 포인트:**
- decorators 불필요
- `argTypes`로 불필요한 prop 숨기기 (children, style 등)

### 3. 훅 (useColorScale 등)

훅은 직접 렌더링할 수 없으므로 래퍼 컴포넌트를 작성합니다.

**Step 1: 래퍼 컴포넌트 작성**

```tsx
// colorscale-story.tsx
export function ColorScaleStoryComponent(colorScaleOptions: ColorScaleOptions) {
  const { colorscale, resolveFeatureData } = useColorScale(colorScaleOptions);
  
  // 훅을 실제로 사용하는 예시 구현
  return (
    <HyperGlobe {...StorybookConstant.props.HyperGlobe}>
      {/* 컴포넌트 구현 */}
    </HyperGlobe>
  );
}
```

**Step 2: 스토리 작성**

```tsx
// use-colorscale.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ColorScaleOptions } from './use-colorscale';
import { ColorScaleStoryComponent } from './colorscale-story';

const meta = {
  title: 'Hooks/useColorScale',
  component: ColorScaleStoryComponent,  // 래퍼 컴포넌트 사용
} satisfies Meta<ColorScaleOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ColorScaleStory: Story = {
  name: 'ColorScale',
  tags: ['autodocs'],
  args: {
    steps: [
      { to: 0, style: { fillColor: '#ffc0c0' } },
      { from: 0, to: 5, style: { fillColor: '#a4c6ec' } },
      { from: 5, style: { fillColor: '#78a9e2' } },
    ],
  },
};
```

### 4. 데모 페이지

복잡한 예제나 실제 사용 사례를 보여주는 데모는 `pages/` 디렉토리에 작성합니다.

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NationsDemo } from './nations';

const meta = {
  title: 'Demo/Nations',
  component: NationsDemo,
} satisfies Meta<typeof NationsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  name: '국가별 세계지도',
  tags: ['autodocs'],
  args: {
    theme: 'blue',
    map: 'nations-high',
  },
  argTypes: {
    theme: {
      control: 'select',
      options: ['pink', 'blue', 'gray'],
    },
    map: {
      control: 'select',
      options: ['nations-low', 'nations-mid', 'nations-high'],
    },
  },
};
```

## 고급 기능

### 1. argTypes 커스터마이징

특정 prop의 컨트롤 타입을 변경하거나 숨길 수 있습니다.

```tsx
argTypes: {
  // select 드롭다운
  theme: {
    control: 'select',
    options: ['blue', 'pink', 'gray'],
  },
  
  // 숨기기
  children: {
    table: {
      disable: true,
    },
  },
  
  // 범위 슬라이더
  opacity: {
    control: { type: 'range', min: 0, max: 1, step: 0.1 },
  },
  
  // 색상 선택기
  color: {
    control: 'color',
  },
}
```

### 2. 커스텀 소스 코드 표시

데모가 복잡한 경우 간소화된 예제 코드를 표시할 수 있습니다.

```tsx
export const Demo: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { HyperGlobe, RegionFeature } from 'hyperglobe';

function Map() {
  return (
    <HyperGlobe>
      <RegionFeature feature={feature} />
    </HyperGlobe>
  );
}`,
      },
    },
  },
};
```

### 3. Decorators에서 스타일 커스터마이징

특정 스토리만 다른 배경이나 스타일이 필요한 경우:

```tsx
decorators: [
  (Story) => (
    <HyperGlobe
      {...StorybookConstant.props.HyperGlobe}
      globeStyle={{
        color: 'white',      // 흰색 지구본
        metalness: 0.7,
        roughness: 0.7,
      }}
    >
      {Story()}
    </HyperGlobe>
  ),
],
```

## StorybookConstant 활용

일관성을 위해 공통 설정은 `StorybookConstant`를 사용합니다.

**정의 위치:** `src/constants/storybook-constant.ts`

```typescript
export const StorybookConstant = {
  props: {
    HyperGlobe: {
      id: 'hyperglobe-canvas',
      size: '100%',
      maxSize: 900,
      style: { margin: '0 auto' },
      globeStyle: {
        color: Colors.GRAY[1],
        metalness: 0,
        roughness: 0,
      },
    },
  },
};
```

**사용 예시:**
```tsx
<HyperGlobe {...StorybookConstant.props.HyperGlobe}>
  {Story()}
</HyperGlobe>
```

## 카테고리 구조

스토리북의 `title` 속성으로 카테고리를 정의합니다.

```
Components/          ← 기본 컴포넌트
  HyperGlobe
  Graticule
  RegionFeature
  PolygonFeature

Hooks/              ← 훅
  useColorScale
  useHGM

Demo/               ← 데모 페이지
  Nations
```

**네이밍 규칙:**
- `title: 'Components/ComponentName'`
- `title: 'Hooks/useHookName'`
- `title: 'Demo/DemoName'`

## 스토리 네이밍

### Meta
- `title`: 카테고리/컴포넌트명 (영문)
- `component`: 실제 컴포넌트

### Story
- export 변수명: `ComponentNameStory` 형식 (PascalCase + Story)
- `name`: 한글 또는 설명적인 이름 (UI에 표시됨)

```tsx
export const GraticuleStory: Story = {
  name: 'Graticule',  // 또는 '격자무늬'
  // ...
};
```

## 체크리스트

새로운 스토리를 작성할 때 확인할 사항:

- [ ] 파일명은 `*.stories.tsx` 형식인가?
- [ ] 컴포넌트와 같은 디렉토리에 위치하는가?
- [ ] `tags: ['autodocs']`를 포함했는가?
- [ ] HyperGlobe 자식 컴포넌트는 decorators로 래핑했는가?
- [ ] StorybookConstant를 활용했는가?
- [ ] 적절한 카테고리(title)를 설정했는가?
- [ ] 필수 args를 제공했는가?
- [ ] 불필요한 props는 argTypes에서 숨겼는가?

## 로컬 실행

```bash
# Storybook 개발 서버 실행
pnpm storybook

# Storybook 빌드
pnpm build-storybook
```

## 참고 자료

- [Storybook 공식 문서](https://storybook.js.org/docs/react/get-started/introduction)
- 프로젝트 내 기존 스토리 파일들
- `src/constants/storybook-constant.ts`

## 관련 문서
- [HyperGlobe 컴포넌트](./hyperglobe-component.md)
- [RegionFeature 컴포넌트](./region-feature.md)
- [Graticule 컴포넌트](./graticule.md)
- [ColorScale 시스템](./colorscale.md)
