/**
 * ColorScaleBar 컴포넌트의 Storybook 문서에서 사용할 코드 스니펫 모음
 *
 * 이 파일은 "Show Code" 버튼을 눌렀을 때 표시될 예제 코드를 관리합니다.
 * 실제 동작하는 코드와 문서에 표시되는 코드를 일관되게 유지하기 위해 사용됩니다.
 */

/**
 * 기본 사용 예제
 *
 * useColorScale 훅으로 컬러스케일을 생성하고
 * ColorScaleBar 컴포넌트에 전달하는 기본적인 사용 방법을 보여줍니다.
 */
export const defaultExample = `// useColorScale 훅으로 컬러스케일 객체 생성
const { colorscale } = useColorScale({
  steps: [
    { to: 0, style: { fillColor: '#f0f9ff' } },
    { from: 0, to: 20, style: { fillColor: '#dbeafe' } },
    { from: 20, to: 40, style: { fillColor: '#bfdbfe' } },
    { from: 40, to: 60, style: { fillColor: '#93c5fd' } },
    { from: 60, to: 80, style: { fillColor: '#60a5fa' } },
    { from: 80, style: { fillColor: '#3b82f6' } },
  ],
  data: [
    { id: '1', value: 10 },
    { id: '2', value: 50 },
    { id: '3', value: 90 },
  ],
});

// props로 컬러스케일 객체 전달
return <ColorScaleBar colorScale={colorscale} />;`;
