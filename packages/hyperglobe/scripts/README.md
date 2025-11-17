# Storybook 코드 스니펫 동기화 스크립트

## 개요

Storybook 스토리의 `render` 함수 내용을 자동으로 추출하여 `code-snippets.ts` 파일에 동기화하는 스크립트입니다.

## 문제점

Storybook의 "Show Code" 기능은 `render` 함수의 실행 결과(props 값)만 보여주고, 훅 사용이나 복잡한 로직은 표시하지 못합니다. 이를 해결하기 위해 `parameters.docs.source.code`에 수동으로 코드를 작성해야 하는데, 이는 다음과 같은 문제가 있습니다:

- ❌ 실제 코드와 문서 코드가 불일치할 수 있음
- ❌ 코드 수정 시 두 곳을 모두 업데이트해야 함
- ❌ 휴먼 에러 발생 가능성

## 해결 방법

이 스크립트는 `render` 함수의 내용을 자동으로 추출하여 코드 스니펫 파일에 동기화합니다.

## 사용법

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 스크립트 실행

```bash
# hyperglobe 패키지에서 실행
cd packages/hyperglobe
pnpm sync:snippets src/components/colorscale-bar/colorscale-bar.stories.tsx
```

또는 루트에서:

```bash
pnpm --filter hyperglobe sync:snippets src/components/colorscale-bar/colorscale-bar.stories.tsx
```

### 3. 결과 확인

`colorscale-bar.code-snippets.ts` 파일의 `defaultExample`이 자동으로 업데이트됩니다.

## 스크립트 동작 원리

1. **추출**: 스토리 파일에서 `Default` 스토리의 `render` 함수 내용을 추출
2. **정규화**: 
   - 주석 제거
   - 변수명 통일 (`_cs` → `colorscale`)
   - `{...args}` 같은 Storybook 전용 문법 제거
   - 불필요한 빈 줄 제거
3. **업데이트**: `code-snippets.ts` 파일의 해당 export 업데이트

## 파일 구조

```
components/colorscale-bar/
├── colorscale-bar.tsx              # 실제 컴포넌트
├── colorscale-bar.stories.tsx     # Storybook 스토리 (소스)
└── colorscale-bar.code-snippets.ts # 코드 스니펫 (자동 생성)
```

## 워크플로우 예시

### Before (수동 관리)

```typescript
export const Default: Story = {
  render: (args) => {
    const { colorscale } = useColorScale({...});
    return <ColorScaleBar colorScale={colorscale} />;
  },
  parameters: {
    docs: {
      source: {
        code: `// 😰 수동으로 작성하고 동기화 유지해야 함
const { colorscale } = useColorScale({...});
return <ColorScaleBar colorScale={colorscale} />;`,
      },
    },
  },
};
```

### After (자동 동기화)

```typescript
// 1. stories 파일에서는 render만 작성
export const Default: Story = {
  render: (args) => {
    const { colorscale } = useColorScale({...});
    return <ColorScaleBar colorScale={colorscale} />;
  },
  parameters: {
    docs: {
      source: {
        code: defaultExample, // ✅ 자동 동기화된 스니펫 사용
      },
    },
  },
};

// 2. 스크립트 실행
// pnpm sync:snippets src/components/colorscale-bar/colorscale-bar.stories.tsx

// 3. code-snippets.ts 자동 업데이트 완료! 🎉
```

## 주의사항

- 현재는 `Default` 스토리만 지원합니다
- `render` 함수는 화살표 함수 형태여야 합니다
- TypeScript/TSX 파일만 지원합니다

## 향후 개선 방향

- [ ] 여러 스토리 동시 처리
- [ ] 커스텀 스토리 이름 지정
- [ ] Git hook 연동으로 자동 실행
- [ ] 더 정교한 코드 포맷팅
