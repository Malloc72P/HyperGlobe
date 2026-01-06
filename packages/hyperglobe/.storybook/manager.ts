import { addons, type State } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';
import { inject } from '@vercel/analytics';
import packageJson from '../package.json';

inject({ mode: 'production' });

// 버전 배지 스타일 주입
const versionBadgeStyle = document.createElement('style');
versionBadgeStyle.textContent = `
  .sidebar-header a[title="HyperGlobe"] {
    display: flex;
    align-items: center;
  }
  .sidebar-header a[title="HyperGlobe"]::after {
    content: 'v${packageJson.version}';
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    color: #6366f1;
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    border-radius: 9999px;
    border: 1px solid #a5b4fc;
    vertical-align: middle;
  }
`;
document.head.appendChild(versionBadgeStyle);

addons.setConfig({
  theme: create({
    // 기본 테마를 'light' 또는 'dark'로 설정
    base: 'light',

    // 브랜딩 정보
    brandTitle: 'HyperGlobe', // 여기에 원하는 텍스트를 입력하세요

    // brandUrl: 'https://github.com/my-org/my-ui-library', // 로고를 클릭했을 때 이동할 URL
    brandImage: '/HyperGlobe.png', // public 폴더에 있는 로고 이미지 경로
    // brandTarget: '_blank', // 링크를 새 탭에서 열기
  }),
});
