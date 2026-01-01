import { addons, type State } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';
import { inject } from '@vercel/analytics';

inject({ mode: 'production' });

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
