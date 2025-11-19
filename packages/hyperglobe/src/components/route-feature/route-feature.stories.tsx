import type { Meta, StoryObj } from '@storybook/react';
import { RouteStoryComponent } from './route-feature-story';
import { RouteFeature } from './route-feature';
import { Colors } from '../..';

const meta = {
  title: 'Components/RouteFeature',
  component: RouteFeature,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RouteFeature>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 서울에서 런던까지의 기본 경로
 */
export const SeoulToLondon: Story = {
  args: {
    from: [126.978, 37.5665], // 서울
    to: [-0.1278, 51.5074], // 런던
    minHeight: 0.01,
    maxHeight: 0.1,
    lineWidth: 0.008,
    minWidth: 0.005,
    segments: 50,
    thickness: 0.004,
    style: {
      color: Colors.BLUE[6],
      fillOpacity: 1,
    },
  },
  render: RouteStoryComponent,
};

// /**
//  * 뉴욕에서 도쿄까지의 경로 (태평양 횡단)
//  */
// export const NewYorkToTokyo: Story = {
//   args: {
//     from: [-74.006, 40.7128], // 뉴욕
//     to: [139.6917, 35.6895], // 도쿄
//     minHeight: 0.02,
//     maxHeight: 0.4,
//     lineWidth: 0.03,
//     minWidth: 0.01,
//     segments: 80,
//     thickness: 0.01,
//     style: {
//       color: '#E74C3C',
//       fillOpacity: 0.9,
//     },
//   },
//   render: (args: typeof NewYorkToTokyo.args) => (
//     <div>
//       <HyperGlobe {...StorybookConstant.props.HyperGlobe}>
//         <RouteFeature {...args} />
//       </HyperGlobe>
//     </div>
//   ),
// };

// /**
//  * 짧은 거리 경로 (서울 - 도쿄)
//  */
// export const ShortDistance: Story = {
//   args: {
//     from: [126.978, 37.5665], // 서울
//     to: [139.6917, 35.6895], // 도쿄
//     minHeight: 0.01,
//     maxHeight: 0.15,
//     lineWidth: 0.015,
//     minWidth: 0.005,
//     segments: 30,
//     thickness: 0.008,
//     style: {
//       color: '#2ECC71',
//       fillOpacity: 0.85,
//     },
//   },
//   render: (args: typeof ShortDistance.args) => (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <HyperGlobe>
//         <RouteFeature {...args} />
//       </HyperGlobe>
//     </div>
//   ),
// };

// /**
//  * 여러 경로 동시 표시
//  */
// export const MultipleRoutes: Story = {
//   args: {
//     from: [126.978, 37.5665],
//     to: [-0.1278, 51.5074],
//     minHeight: 0.01,
//     maxHeight: 0.3,
//     lineWidth: 0.02,
//   },
//   render: () => (
//     <div>
//       <HyperGlobe {...StorybookConstant.props.HyperGlobe}>
//         {/* 서울 → 런던 */}
//         <RouteFeature
//           from={[126.978, 37.5665]}
//           to={[-0.1278, 51.5074]}
//           minHeight={0.01}
//           maxHeight={0.3}
//           lineWidth={0.02}
//           style={{ color: '#4A90E2', fillOpacity: 0.8 }}
//         />
//         {/* 뉴욕 → 도쿄 */}
//         <RouteFeature
//           from={[-74.006, 40.7128]}
//           to={[139.6917, 35.6895]}
//           minHeight={0.02}
//           maxHeight={0.35}
//           lineWidth={0.025}
//           style={{ color: '#E74C3C', fillOpacity: 0.8 }}
//         />
//         {/* 시드니 → 케이프타운 */}
//         <RouteFeature
//           from={[151.2093, -33.8688]}
//           to={[18.4241, -33.9249]}
//           minHeight={0.015}
//           maxHeight={0.25}
//           lineWidth={0.018}
//           style={{ color: '#2ECC71', fillOpacity: 0.8 }}
//         />
//       </HyperGlobe>
//     </div>
//   ),
// };

// /**
//  * 높이 프로필 테스트 - 낮은 궤적
//  */
// export const LowArc: Story = {
//   args: {
//     from: [0, 0] as [number, number],
//     to: [90, 0] as [number, number],
//     minHeight: 0.005,
//     maxHeight: 0.1,
//     lineWidth: 0.025,
//     segments: 50,
//     style: {
//       color: '#9B59B6',
//       fillOpacity: 0.9,
//     },
//   },
//   render: (args: typeof LowArc.args) => (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <HyperGlobe>
//         <RouteFeature {...args} />
//       </HyperGlobe>
//     </div>
//   ),
// };

// /**
//  * 높이 프로필 테스트 - 높은 궤적
//  */
// export const HighArc: Story = {
//   args: {
//     from: [0, 0] as [number, number],
//     to: [90, 0] as [number, number],
//     minHeight: 0.02,
//     maxHeight: 0.5,
//     lineWidth: 0.025,
//     segments: 50,
//     style: {
//       color: '#F39C12',
//       fillOpacity: 0.9,
//     },
//   },
//   render: (args: typeof HighArc.args) => (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <HyperGlobe>
//         <RouteFeature {...args} />
//       </HyperGlobe>
//     </div>
//   ),
// };

// /**
//  * 너비 프로필 테스트
//  */
// export const WidthVariation: Story = {
//   args: {
//     from: [126.978, 37.5665] as [number, number],
//     to: [-0.1278, 51.5074] as [number, number],
//     minHeight: 0.01,
//     maxHeight: 0.3,
//     lineWidth: 0.04, // 넓은 끝
//     minWidth: 0.002, // 좁은 시작
//     segments: 60,
//     style: {
//       color: '#E67E22',
//       fillOpacity: 0.85,
//     },
//   },
//   render: (args: typeof WidthVariation.args) => (
//     <div style={{ width: '100vw', height: '100vh' }}>
//       <HyperGlobe>
//         <RouteFeature {...args} />
//       </HyperGlobe>
//     </div>
//   ),
// };
